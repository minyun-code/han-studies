# 早稲田大学漢学研究所 / Waseda Han Studies

Next.js 前端和 Strapi 后端的统一仓库。下面的路径和命令均以仓库根目录为基准。
Next.js フロントエンドと Strapi バックエンドをまとめたリポジトリです。以下のパスとコマンドはルートを基準にしています。

```text
.
├── frontend/                 # Next.js
│   └── BUILD_AND_USAGE_ZH_JA.md
├── backend/                  # Strapi
│   ├── database/content-snapshot.sqlite  # 可恢复的业务快照 / 復元用コンテンツ DB
│   ├── public/uploads/       # 全部上传图片，Git 管理 / 全アップロード画像、Git 管理対象
│   └── .env.example          # 配置模板 / 設定テンプレート
├── scripts/                  # 预览、资源同步和数据库工具 / プレビュー・同期・DB ツール
├── releases/                 # 本地交付包，忽略 / 配布物、Git 対象外
└── .local/                   # 旧历史、私有备份和导出临时文件，忽略 / ローカル保存、Git 対象外
```

## 使用 / 利用方法

使用符合项目约束的 Node.js 22.x。后端当前采用 pnpm 10 和 `backend/pnpm-lock.yaml`，前端继续采用 npm 锁文件；不要用两种管理器轮流重装同一份 `node_modules`。根目录没有依赖需要安装。
プロジェクトの制約を満たす Node.js 22.x を使用します。現在のバックエンドは pnpm 10 と `backend/pnpm-lock.yaml`、フロントエンドは npm のロックファイルを使用します。同じ `node_modules` を npm と pnpm で交互に再インストールしないでください。ルートでの依存インストールは不要です。

首次安装、前端本地插件和故障处理见 [中日双语使用说明](frontend/BUILD_AND_USAGE_ZH_JA.md)。新机器先依据 `backend/.env.example` 准备自己的 `backend/.env`，为其中的密钥生成独立值；原 `.env` 不进入 Git。模板没有数据库字段时，配置默认使用 SQLite 的 `.tmp/data.db`。
初回導入、フロントエンドのローカルプラグイン、トラブル対応は [中国語・日本語ガイド](frontend/BUILD_AND_USAGE_ZH_JA.md) を参照してください。新しい端末では `backend/.env.example` を基に `backend/.env` を用意し、独自の秘密情報を設定します。元の `.env` は Git に含めません。DB の項目がない場合も、既定で SQLite の `.tmp/data.db` を使用します。

```powershell
# 后端依赖及原生模块 / バックエンドとネイティブ依存
pnpm --dir ./backend install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw 'Backend dependency installation failed.' }
pnpm --dir ./backend rebuild better-sqlite3 '@swc/core' esbuild
if ($LASTEXITCODE -ne 0) { throw 'Native dependency build failed.' }

# 前端依赖；本地插件的额外步骤见完整说明 / プラグインの追加準備はガイド参照
npm --prefix ./frontend ci
if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
```

**仅新机器、运行数据库不存在时恢复。现有本机已保留数据库，不运行恢复。** 恢复工具绝不覆盖已有数据库。
**新しい端末で実行 DB がない場合だけ復元します。既存の DB がある端末では実行しません。** 復元ツールは既存 DB を上書きしません。

```powershell
npm run data:check
if ($LASTEXITCODE -ne 0) { throw 'Content snapshot validation failed.' }
npm run data:restore
if ($LASTEXITCODE -ne 0) { throw 'Content restore failed; skip restoration when a DB already exists.' }
```

恢复后启动，首次访问 [Strapi 管理后台](http://127.0.0.1:1337/admin) 创建自己的管理员；快照不含旧管理账号和 API 凭据。现有本机继续使用自己的账号。
復元後に起動し、初回に [Strapi 管理画面](http://127.0.0.1:1337/admin) で自分の管理者を作成します。旧管理者と API 認証情報は含まれません。既存の端末では自分のアカウントを継続使用します。

```powershell
# 终端 1 / ターミナル 1
npm run dev:backend

# 终端 2，开发时 / ターミナル 2、開発時
npm run dev:frontend
```

打包时停止前端开发服务、保持 CMS 运行，然后同步资源、构建并预览：
ビルド時はフロントエンドの開発サーバーを停止し、CMS は起動したままにして、アセット同期・ビルド・プレビューを実行します。

```powershell
npm run sync:uploads
npm run build:frontend
npm run preview
```

静态预览地址：[http://127.0.0.1:3001](http://127.0.0.1:3001)。
静的プレビュー：[http://127.0.0.1:3001](http://127.0.0.1:3001)。

## 数据与图片的 Git 管理 / DB と画像の Git 管理

`backend/database/content-snapshot.sqlite` 和 `backend/public/uploads/` 全部图片纳入版本控制，当前为 259 个图片文件。快照包含业务内容、媒体元数据和角色定义；匿名权限仅保留公开内容读取，需要写权限时由恢复后的管理员另行配置。原运行数据库权限不变。快照已清除管理员、普通用户、API/传输令牌、会话、Webhook、历史和作者引用。它是可恢复的内容副本，不是本机运行数据库的直接上传。
`backend/database/content-snapshot.sqlite` と `backend/public/uploads/` の全画像を Git 管理します。現在の画像は 259 ファイルです。コンテンツ、メディア情報、ロール定義を保持し、匿名アクセスは公開コンテンツの読み取りだけに制限します。書き込み権限が必要な場合は復元後の管理者が別途設定し、元の実行 DB の権限は変更しません。管理者、一般ユーザー、API・転送トークン、セッション、Webhook、履歴、作成者・更新者の参照を除去します。復元用のコピーであり、実行 DB の直接アップロードではありません。

快照不会自动实时更新。CMS 修改后需重新导出、检查，并将新快照和变更图片一并 commit、推送：
スナップショットはリアルタイム同期しません。CMS 更新後は再出力・検査し、更新 DB と変更画像をコミット・プッシュします。

```powershell
npm run data:export
if ($LASTEXITCODE -ne 0) { throw 'Content snapshot export failed.' }
npm run data:check
if ($LASTEXITCODE -ne 0) { throw 'Content snapshot validation failed.' }
```

导出只读打开运行数据库，以 SQLite 在线备份建立 `.local/` 临时副本，在副本中清理并 `VACUUM` 后发布快照，不清理原运行数据库。`data:check` 检查快照，`data:restore` 仅将它复制到不存在的默认 `backend/.tmp/data.db`。
実行 DB は読み取り専用で開き、オンラインバックアップで `.local/` に作るコピーを清掃・`VACUUM` して出力します。元の実行 DB は清掃しません。`data:check` はスナップショットを検査し、`data:restore` は既定の `backend/.tmp/data.db` がない場合だけコピーします。

`backend/.env`、原运行数据库 `backend/.tmp/data.db`、依赖目录及 `.local/` 继续排除在 Git 之外。旧 Git 历史、旧内嵌后端、迁移前构建缓存保存在 `.local/legacy-frontend-git/`、`.local/legacy-backend/`、`.local/frontend-next-before-move/`；这些私有备份不加入上传范围。
`backend/.env`、元の実行 DB `backend/.tmp/data.db`、依存関係、`.local/` は引き続き Git 対象外です。旧 Git 履歴、旧バックエンド、移動前キャッシュはそれぞれ `.local/legacy-frontend-git/`、`.local/legacy-backend/`、`.local/frontend-next-before-move/` に保存し、これらのローカルバックアップはアップロードしません。
