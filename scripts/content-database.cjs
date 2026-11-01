'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const repoRoot = path.resolve(__dirname, '..');
const backendRoot = path.join(repoRoot, 'backend');
const liveDatabase = path.join(backendRoot, '.tmp/data.db');
const snapshot = path.join(backendRoot, 'database/content-snapshot.sqlite');
const backendRequire = createRequire(path.join(backendRoot, 'package.json'));

const privateTables = [
  'admin_users',
  'admin_users_roles_lnk',
  'up_users',
  'up_users_role_lnk',
  'strapi_api_tokens',
  'strapi_api_token_permissions',
  'strapi_api_token_permissions_token_lnk',
  'strapi_api_tokens_admin_user_owner_lnk',
  'admin_permissions_api_token_lnk',
  'strapi_transfer_tokens',
  'strapi_transfer_token_permissions',
  'strapi_transfer_token_permissions_token_lnk',
  'strapi_sessions',
  'strapi_webhooks',
  'strapi_history_versions',
];

const contentTables = [
  'announcements', 'events', 'galleries', 'projects',
  'publications', 'researchers', 'files',
];

const privateSettings = [
  'core_admin_auth',
  'plugin_users-permissions_grant',
  'plugin_users-permissions_email',
];

const quote = (identifier) => `"${identifier.replaceAll('"', '""')}"`;

function tableNames(db) {
  return db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all().map((row) => row.name);
}

function contentCounts(db) {
  const tables = new Set(tableNames(db));
  return Object.fromEntries(contentTables.filter((table) => tables.has(table))
    .map((table) => [table, db.prepare(`SELECT COUNT(*) AS total FROM ${quote(table)}`).get().total]));
}

function isPublicRead(action) {
  return /^api::[^.]+\.[^.]+\.(find|findOne)$/.test(action)
    || /^plugin::upload\.content-api\.(find|findOne)$/.test(action)
    || action === 'plugin::i18n.locales.listLocales';
}

function publicPermissions(db) {
  return db.prepare(`
    SELECT l.id AS link_id, p.id AS permission_id, p.action
    FROM up_permissions p
    JOIN up_permissions_role_lnk l ON l.permission_id = p.id
    JOIN up_roles r ON r.id = l.role_id
    WHERE r.type = 'public'
  `).all();
}

function inspect(db) {
  if (db.pragma('quick_check', { simple: true }) !== 'ok') {
    throw new Error('Snapshot failed SQLite quick_check.');
  }
  if (db.pragma('foreign_key_check').length > 0) {
    throw new Error('Snapshot contains invalid foreign key references.');
  }
  const tables = tableNames(db);
  const unknownPrivateTables = tables.filter((table) => /admin_users|up_users|token|session|webhook|history/i.test(table)
    && !privateTables.includes(table));
  if (unknownPrivateTables.length > 0) {
    throw new Error(`Review new private tables before exporting: ${unknownPrivateTables.join(', ')}`);
  }
  for (const table of privateTables.filter((table) => tables.includes(table))) {
    if (db.prepare(`SELECT COUNT(*) AS total FROM ${quote(table)}`).get().total !== 0) {
      throw new Error(`Snapshot contains private records in ${table}.`);
    }
  }
  for (const table of tables) {
    const columns = db.pragma(`table_info(${quote(table)})`).map((column) => column.name);
    for (const column of ['created_by_id', 'updated_by_id'].filter((column) => columns.includes(column))) {
      if (db.prepare(`SELECT COUNT(*) AS total FROM ${quote(table)} WHERE ${quote(column)} IS NOT NULL`).get().total !== 0) {
        throw new Error(`Snapshot retains account attribution in ${table}.`);
      }
    }
  }
  if (publicPermissions(db).some((permission) => !isPublicRead(permission.action))) {
    throw new Error('Snapshot contains public permissions beyond content reads.');
  }
  if (tables.includes('strapi_core_store_settings')) {
    const findSetting = db.prepare('SELECT COUNT(*) AS total FROM strapi_core_store_settings WHERE key = ?');
    if (privateSettings.some((key) => findSetting.get(key).total !== 0)) {
      throw new Error('Snapshot still contains private authentication or email settings.');
    }
  }
  const counts = contentCounts(db);
  if (Object.keys(counts).length !== contentTables.length) {
    throw new Error('Snapshot is missing expected content tables.');
  }
  return counts;
}

async function exportSnapshot(Database) {
  if (!fs.existsSync(liveDatabase)) {
    throw new Error('The live database backend/.tmp/data.db does not exist.');
  }
  const staging = path.join(repoRoot, '.local', `content-export-${crypto.randomUUID()}`);
  fs.mkdirSync(staging, { recursive: true });
  const workingCopy = path.join(staging, 'working.sqlite');
  const source = new Database(liveDatabase, { readonly: true, fileMustExist: true });
  try {
    await source.backup(workingCopy);
  } finally {
    source.close();
  }

  const db = new Database(workingCopy, { fileMustExist: true });
  let counts;
  const originalSecrets = [];
  try {
    const tables = tableNames(db);
    const originalCounts = contentCounts(db);
    if (Object.keys(originalCounts).length !== contentTables.length) {
      throw new Error('Expected project content tables are missing. Review the database schema before exporting.');
    }
    for (const table of privateTables.filter((table) => tables.includes(table))) {
      const columns = db.pragma(`table_info(${quote(table)})`).map((column) => column.name);
      const secretColumns = columns.filter((column) => /password|access_key|encrypted_key|registration_token|reset_password_token|secret/i.test(column));
      for (const column of secretColumns) {
        for (const row of db.prepare(`SELECT ${quote(column)} AS value FROM ${quote(table)} WHERE ${quote(column)} IS NOT NULL`).all()) {
          if (typeof row.value === 'string' && row.value.length >= 12) originalSecrets.push(row.value);
        }
      }
    }
    db.pragma('foreign_keys = OFF');
    db.pragma('secure_delete = ON');
    db.transaction(() => {
      for (const table of tables) {
        const columns = db.pragma(`table_info(${quote(table)})`).map((column) => column.name);
        const assignments = ['created_by_id', 'updated_by_id']
          .filter((column) => columns.includes(column)).map((column) => `${quote(column)} = NULL`);
        if (assignments.length > 0) db.exec(`UPDATE ${quote(table)} SET ${assignments.join(', ')}`);
      }
      for (const table of privateTables.filter((table) => tables.includes(table))) {
        db.exec(`DELETE FROM ${quote(table)}`);
        if (tables.includes('sqlite_sequence')) {
          db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run(table);
        }
      }
      for (const permission of publicPermissions(db).filter((permission) => !isPublicRead(permission.action))) {
        db.prepare('DELETE FROM up_permissions_role_lnk WHERE id = ?').run(permission.link_id);
        const remaining = db.prepare('SELECT COUNT(*) AS total FROM up_permissions_role_lnk WHERE permission_id = ?')
          .get(permission.permission_id).total;
        if (remaining === 0) db.prepare('DELETE FROM up_permissions WHERE id = ?').run(permission.permission_id);
      }
      if (tables.includes('strapi_core_store_settings')) {
        const removeSetting = db.prepare('DELETE FROM strapi_core_store_settings WHERE key = ?');
        for (const key of privateSettings) removeSetting.run(key);
      }
    })();
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.pragma('journal_mode = DELETE');
    db.exec('VACUUM');
    db.pragma('foreign_keys = ON');
    counts = inspect(db);
    if (JSON.stringify(counts) !== JSON.stringify(originalCounts)) {
      throw new Error('Content row counts changed during sanitization.');
    }
  } finally {
    db.close();
  }

  const bytes = fs.readFileSync(workingCopy);
  if (originalSecrets.some((value) => bytes.includes(Buffer.from(value)))) {
    throw new Error('A removed credential is still present in the snapshot bytes. Export was not published.');
  }
  if (fs.existsSync(snapshot)) {
    fs.copyFileSync(snapshot, path.join(staging, 'previous-snapshot.sqlite'));
  }
  fs.copyFileSync(workingCopy, snapshot);
  console.log('Exported backend/database/content-snapshot.sqlite. The live database was not modified.');
  console.log(JSON.stringify({ content: counts, privateRecords: 0, credentialRemnants: 0, publicPermissions: 'content reads only' }));
}

function checkSnapshot(Database) {
  const db = new Database(snapshot, { readonly: true, fileMustExist: true });
  try {
    console.log(JSON.stringify({ snapshot: 'backend/database/content-snapshot.sqlite', content: inspect(db), privateRecords: 0, publicPermissions: 'content reads only' }));
  } finally {
    db.close();
  }
}

function restoreSnapshot(Database) {
  if (fs.existsSync(liveDatabase)) {
    throw new Error('backend/.tmp/data.db already exists and was preserved. Restore only on a new setup; never overwrite a running database.');
  }
  checkSnapshot(Database);
  fs.mkdirSync(path.dirname(liveDatabase), { recursive: true });
  fs.copyFileSync(snapshot, liveDatabase, fs.constants.COPYFILE_EXCL);
  console.log('Restored backend/.tmp/data.db. Configure backend/.env, start Strapi, and create your own administrator at /admin.');
}

async function main() {
  const command = process.argv[2];
  if (process.argv.length !== 3 || !['export', 'check', 'restore'].includes(command)) {
    throw new Error('Usage: node scripts/content-database.cjs <export|check|restore>');
  }
  const Database = backendRequire('better-sqlite3');
  if (command === 'export') await exportSnapshot(Database);
  if (command === 'check') checkSnapshot(Database);
  if (command === 'restore') restoreSnapshot(Database);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
