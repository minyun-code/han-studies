# 打包逻辑与使用说明 / ビルドと利用ガイド

适用项目 / 対象：早稲田大学漢学研究所（`waseda-hanstudies`）  
核对日期 / 確認日：2026-11-01

本文依据当前源码、已安装插件和配置编写。本文中的安装、启动、复制和构建命令供使用者执行；迁移后尚未重新执行依赖安装、资源实际复制或完整构建，不能将文档步骤视为新环境已验证通过。**所有命令均从仓库根目录运行**，即同时包含 `frontend/`、`backend/`、`scripts/` 和根 `package.json` 的目录。仓库可整体移动，不要求固定盘符或父目录；命令块使用 PowerShell。

この文書は、現在のソース、インストール済みプラグイン、設定に基づいています。記載したインストール、起動、コピー、ビルドは利用者向けの手順です。移動後の依存関係の再インストール、アセットの実コピー、完全なビルドは未実行であり、新しい環境での動作確認が完了したことを意味しません。**すべてのコマンドはリポジトリのルートから実行します**。ルートは `frontend/`、`backend/`、`scripts/` とルートの `package.json` があるディレクトリです。リポジトリ全体を移動しても、特定のドライブや親ディレクトリに依存しません。コマンド例は PowerShell 用です。

## 目录与角色 / ディレクトリと役割

| 仓库相对路径 / ルートからの相対パス | 作用 / 役割 |
| --- | --- |
| `./` | 本地 Git 仓库根目录与统一命令入口 / ローカル Git リポジトリのルートと共通コマンド |
| `frontend/` | Next.js 前端源码 / Next.js フロントエンド |
| `frontend/app/` | 页面、组件、静态路由 / ページ、コンポーネント、静的ルート |
| `frontend/public/` | 图片等公开资源 / 画像などの公開アセット |
| `frontend/next-ssg-asset-downloader/` | 本地资源下载插件源码 / ローカルのアセット取得プラグイン |
| `frontend/.next/` | Next.js 构建中间目录，不提交 / Next.js のビルド中間生成物。コミット対象外 |
| `frontend/out/` | 前端静态导出目录，不提交 / 静的サイトの出力先。コミット対象外 |
| `backend/` | 本项目使用的 Strapi 后端 / 使用する Strapi バックエンド |
| `scripts/preview-static.cjs` | 本仓库静态预览脚本 / リポジトリ内の静的プレビュー用スクリプト |
| `scripts/sync-uploads.cjs` | 从后端复制上传资源到前端 / バックエンドからフロントエンドへのアセットコピー |
| `releases/` | 可选的版本归档与 ZIP，不提交 / 任意の版別アーカイブと ZIP。コミット対象外 |
| `.local/legacy-frontend-git/` | 原前端 Git 历史的本地备份，不提交 / 旧フロントエンドの Git 履歴のローカル保存。コミット対象外 |
| `.local/legacy-backend/` | 原前端内嵌的旧后端及数据，不提交、不用于启动 / 旧バックエンドとデータの保存。コミット・起動対象外 |
| `.local/frontend-next-before-move/` | 迁移前的旧构建缓存，不提交、不复用 / 移動前のビルドキャッシュ。コミット・再利用対象外 |

本文只启动 `backend/`，不混用历史后端的数据库和上传资源。迁移前的缓存可能含旧绝对路径，开发和构建应在新目录重新生成 `frontend/.next/`。数据库、环境文件、依赖和 `.local/` 只在本地保留；Git 源码仓库不能替代这些运行数据的备份。

本書では `backend/` のみを起動し、過去のコピーのデータベースやアセットを混在させません。移動前のキャッシュには古い絶対パスが含まれる場合があるため、新しい場所で `frontend/.next/` を再生成します。データベース、環境ファイル、依存関係、`.local/` はローカルに保持します。ソースの Git 管理は、これらの実行データのバックアップの代わりにはなりません。

---

## 中文说明

### 1. 项目如何工作

前端使用 Next.js 15.2.0、React 和 App Router；后端使用 Strapi 5。主要流程是：

```text
backend/ 数据库和 public/uploads
        │  构建时通过 http://127.0.0.1:1337/api/... 读取内容
        ▼
Next.js 页面预渲染 ─── frontend/public/ 中的资源
        │                 │
        └──── 静态导出 ────┘
                  ▼
           frontend/out/
                  │  人工核验、复制或压缩
                  ▼
       releases/版本目录 / 静态网站服务器
```

根 `package.json` 提供统一入口，并在对应子项目目录中执行命令：

| 从仓库根运行 | 用途 |
| --- | --- |
| `npm run dev:backend` | 启动 Strapi 开发服务，当前端口 1337 |
| `npm run dev:frontend` | 启动 Next.js 开发服务，默认端口 3000 |
| `npm run build:backend` | 构建 Strapi 管理后台；不生成前端静态站 |
| `npm run build:frontend` | 执行前端 `next build`，按当前配置导出静态站 |
| `npm run sync:uploads` | 将后端上传资源复制到前端 |
| `npm run preview` | 预览 `frontend/out/`，默认端口 3001 |
| `npm --prefix ./frontend run lint` | 单独运行前端现有 `next lint` 检查命令 |

前端仍有 `start: next start`，但当前 `output: 'export'` 方案使用静态预览。实际配置为 `frontend/next.config.js`。当前安装的 Next.js 按 `next.config.js`、`next.config.mjs`、`next.config.ts` 的顺序查找，旁边的空 `next.config.ts` 不会覆盖或合并 JS 配置。

### 2. 环境与依赖准备

先在仓库根检查运行环境：

```powershell
node --version
npm --version
```

`backend/package.json` 声明 Node.js 范围为 `>=18.0.0 <=22.x.x`。选择满足前后端依赖要求的版本，例如此范围内的 Node.js 22.x；不要仅因机器安装了更新版本就假定兼容。原生依赖 `better-sqlite3` 也需要与所用 Node.js 版本匹配。

已有依赖可正常使用时可进入启动步骤。首次安装、换机或切换 Node.js 后，在仓库根分别安装前后端依赖；每一步成功后再执行下一步：

```powershell
npm --prefix ./backend ci
if ($LASTEXITCODE -ne 0) { throw '后端依赖安装失败。' }
npm --prefix ./frontend ci
if ($LASTEXITCODE -ne 0) { throw '前端依赖安装失败。' }
```

**本地插件需要额外准备。** `frontend/package.json` 和锁文件尚未登记 `next-ssg-asset-downloader`；现有 `frontend/node_modules` 中仅有手工放入的插件 `dist`。`npm ci` 会重建依赖目录，不能靠当前锁文件恢复这份手工插件。

插件缺失时，可从仓库根执行以下准备步骤。这会安装依赖、生成插件 `dist`，并登记前端本地依赖、更新前端清单与锁文件：

```powershell
npm --prefix ./frontend/next-ssg-asset-downloader ci
if ($LASTEXITCODE -ne 0) { throw '插件依赖安装失败。' }
npm --prefix ./frontend/next-ssg-asset-downloader run build
if ($LASTEXITCODE -ne 0) { throw '插件构建失败。' }
Push-Location -LiteralPath './frontend'
try {
    npm install './next-ssg-asset-downloader'
    if ($LASTEXITCODE -ne 0) { throw '插件安装失败。' }
    node -e "require('next-ssg-asset-downloader/dist'); console.log('plugin import OK')"
    if ($LASTEXITCODE -ne 0) { throw '插件加载失败。' }
} finally {
    Pop-Location
}
```

插件声明 `node-fetch ^3.3.2` 并编译为 CommonJS，迁移保留的手工安装版实际解析到的 `node-fetch` 为 1.7.3。重新安装后的依赖组合并不等同于现状；若出现 `ERR_REQUIRE_ESM`、模块缺失或编译错误，需先处理兼容问题。上述重新安装与完整构建尚未在本次文档更新中执行验证。

### 3. 启动后端并确认内容

在独立终端的仓库根运行：

```powershell
npm run dev:backend
```

当前后端端口为 `1337`，使用 SQLite，数据库为 `backend/.tmp/data.db`。保留 `backend/.env`、`backend/.tmp/data.db` 和 `backend/public/uploads/`，不需要为现有配置另外建立 MySQL 数据库。新克隆的源码不包含这些本地数据，需要从自己的备份恢复环境与内容后再使用。

- 后台管理：[http://127.0.0.1:1337/admin](http://127.0.0.1:1337/admin)。使用已有管理员账号。
- 内容在后台编辑并发布；允许前端实际使用的公开读取操作。
- 前端读取 `announcements`、`events`、`projects`、`publications`、`researchers` 等集合。

可在另一个终端只读检查公告接口：

```powershell
$response = Invoke-RestMethod -Uri 'http://127.0.0.1:1337/api/announcements?populate=*'
$response.meta.pagination
```

返回 HTTP 200 之外，还需检查内容已发布、分页数量和图片地址。`401/403` 通常需要检查读取权限。不要把环境文件、数据库、管理员账号或密钥放入前端交付包。

大多数页面把 API 地址写为 `http://127.0.0.1:1337`，只有部分活动和研讨会详情读取 `NEXT_PUBLIC_API_URL`，单独设置它不能切换全站后端。这里的 HTTP 地址属于服务地址，不是文件系统路径；移动仓库不会改变本地服务端口。构建时的服务端请求仍需要有效的完整 API URL。

### 4. 本地开发与资源准备

保持后端运行，在另一个终端的仓库根启动前端：

```powershell
npm run dev:frontend
```

访问 [http://127.0.0.1:3000](http://127.0.0.1:3000)。开发配置将 `/uploads/*` 代理到后端 `1337`，没有 `/api/*` 代理。

打包前使用仓库脚本，从 `backend/public/uploads/` 复制文件到 `frontend/public/uploads/`。先用 `--dry-run` 查看计划，再实际复制；实际操作会新增文件、覆盖同名文件，不删除前端独有的其他文件：

```powershell
node ./scripts/sync-uploads.cjs --dry-run
if ($LASTEXITCODE -ne 0) { throw '资源同步预检查失败。' }
npm run sync:uploads
if ($LASTEXITCODE -ne 0) { throw '资源同步失败。' }
```

`frontend/scripts/sync-images.js` 是旧同步脚本，依赖 `/uploads/` 返回 HTML 目录列表，只识别小写 `.jpg` 和 `.png`，没有加入前端 npm scripts。它不能保证同步 WebP、PDF 等资源，不是本文的必跑步骤。

### 5. 执行打包及理解加工顺序

先在前端开发终端按 `Ctrl+C` 停止 `dev:frontend`，避免开发与构建同时写入 `frontend/.next/`。后端保持运行，依赖和资源准备完成后，在仓库根执行：

```powershell
npm run build:frontend
if ($LASTEXITCODE -ne 0) { throw '前端构建失败，请检查上方日志。' }
```

现有配置与插件的实际行为如下：

1. `frontend/next.config.js` 设置 `output: 'export'`，输出为 `frontend/out/`，中间产物为 `frontend/.next/`。
2. 资源插件仅在生产环境的服务端 Webpack `beforeCompile` 执行，开发模式默认跳过下载。
3. 插件递归扫描**构建开始前已有的 `frontend/out/` HTML**，把匹配资源下载到 `frontend/public/uploads/`。首次没有旧 `out` 时只给提示，不能发现本次尚未生成的页面资源。
4. 插件配置中的 `htmlDir: 'out'`、`outputDir: 'public/uploads'` 相对前端工作目录；`baseUrl` 为 `http://localhost:1337`，筛选前缀为 `/uploads/`。默认每批并发 5 个，按 URL 最后一级文件名保存，同名覆盖。根命令会进入前端工作目录执行，不能直接在仓库根调用裸 `next build` 代替。
5. Next.js 预渲染时请求 CMS 数据，生成页面和静态详情，并将 `frontend/public/` 的文件复制到导出目录，例如 `frontend/public/uploads/a.jpg` 对应 `frontend/out/uploads/a.jpg`。
6. 插件**不修改 HTML/JS 中的资源 URL**，也不自动归档到 `releases/`。部分相对资源路径由页面组件处理，发布前仍需检查本地绝对 URL 是否残留。

下载器默认支持 `.jpg/.jpeg/.png/.gif/.webp/.svg/.mp4/.mp3/.pdf/.zip`，不扫描 CSS `url()`、`srcset` 或运行时 JavaScript/RSC 中的资源引用。单个下载失败通常仅记录日志，不会自动中止构建。重复构建或构建成功不能替代资源完整性核验；插件 README 所述“构建完成后扫描”与当前实际时机不同。

`images.unoptimized: true` 表示静态站不依赖 Next.js 图片优化服务。`productionBrowserSourceMaps` 实际为 `true`，不能按旁边的注释认定源码映射已关闭。TypeScript 和 ESLint 的构建阻断检查也被关闭，构建成功不代表类型、规则和所有功能均已通过。

`npm run build:backend` 另用于 Strapi 管理后台构建，不会替代前端打包，也不会打包数据库和上传资源。

### 6. 更新内容与详情路由

静态站的 CMS 内容是构建时快照。修改内容或图片后，需要重新同步资源、构建并发布。源码中的 `revalidate: 3600` 不会让已导出的静态文件每小时自动更新。

| 页面源码（仓库相对路径） | 当前静态详情生成方式 |
| --- | --- |
| `frontend/app/news/announcements/[slug]/page.tsx` | 从 API 读取公告 slug，但未分页；后端默认每页 25 条，不能保证全部覆盖 |
| `frontend/app/news/events/[slug]/page.tsx` | 硬编码 `event`、`event-1` 至 `event-10` |
| `frontend/app/symposium/[slug]/page.tsx` | 硬编码 `event`、`event-1` 至 `event-5` |
| `frontend/app/studies/projects/[slug]/page.tsx` | 硬编码 `valuing-air-project`、`ushita-arts-initiative`、`project-1`、`project-2` |

只在 CMS 新增记录，不保证生成对应详情文件。超出列表或公告分页范围时，先维护 `generateStaticParams` 的逻辑或列表，再构建。

### 7. 预览本次静态包

构建成功后，从仓库根启动本仓库的预览脚本：

```powershell
npm run preview
```

默认服务目录是 `frontend/out/`，访问 [http://127.0.0.1:3001](http://127.0.0.1:3001)，用 `Ctrl+C` 停止。脚本支持 `/about` 对应 `/about.html` 等无扩展路径，仅用于本地预览。不需要外部历史目录或旧预览脚本，也不使用前端的 `next start`。

检查首页、各类详情、图片、附件，以及直接访问和刷新详情 URL。构建结束后可停止 CMS，再检查主要静态页面是否仍依赖本地后端；搜索的限制见第 9 节。

### 8. 归档与部署

构建不会自动归档到 `releases/`。需要保存交付版本时，在仓库根执行以下可选步骤，创建新版本目录并生成 ZIP；不会覆盖旧版本。`releases/` 已排除在 Git 提交之外：

```powershell
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath './frontend/out/index.html' -PathType Leaf)) {
    throw '未找到静态首页，请先成功构建并核验 frontend/out。'
}
$releaseDir = Join-Path './releases' ('out_' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
if ((Test-Path -LiteralPath $releaseDir) -or (Test-Path -LiteralPath ($releaseDir + '.zip'))) {
    throw '归档目标已存在，请使用新目录。'
}
New-Item -ItemType Directory -Path $releaseDir | Out-Null
Get-ChildItem -LiteralPath './frontend/out' -Force |
    Copy-Item -Destination $releaseDir -Recurse -Force
Compress-Archive -LiteralPath $releaseDir -DestinationPath ($releaseDir + '.zip')
```

ZIP 解压后有一层版本目录。部署时让站点根对应其中 `index.html` 所在目录，并保留 `_next`、`uploads`、图片和子目录，不能只上传 HTML。生产静态服务器需支持 `/about` 解析到 `/about.html`。未生成的详情应返回 404，不应统一返回首页掩盖缺失页面。

只交付已核验的静态产物；不要把 `backend/`、`.local/`、依赖目录或仓库全部内容当作前端包部署。

### 9. 当前已知限制与排查

| 现象 | 检查方向 |
| --- | --- |
| 找不到 `next-ssg-asset-downloader/dist` | 本地插件、`dist` 与前端清单；现有锁文件不能单独恢复手工插件 |
| CMS 请求失败、列表为空或有占位内容 | 1337 服务、发布状态、公开读取权限、API 地址和分页；部分组件会返回默认内容 |
| 新详情 404 | `generateStaticParams`、硬编码 slug、公告分页和 `frontend/out/` 的详情文件 |
| 图片或附件缺失 | `backend/public/uploads/`、`frontend/public/uploads/`、`frontend/out/uploads/`；旧 HTML 扫描不涵盖全部新资源 |
| CMS 更新后站点未变化 | 重新同步、构建并发布；静态文件不执行服务器端定时再验证 |
| 预览还是旧版 | 确认本次构建成功、预览指向 `frontend/out/`，并刷新浏览器 |
| 搜索无结果或报错 | 浏览器端 `frontend/app/search/SearchClient.tsx` 请求同源 `/api/*`，开发配置和静态预览均无对应代理 |

搜索还按 `item.attributes` 读取部分字段，并把项目、研究员结果链接到 `/projects/`、`/researchers/`，与实际页面结构有差异。需要搜索时，应另行核实 Strapi 5 数据结构、修正链接，并提供同源 API 代理或静态搜索方案。仅迁移目录、改成相对文件路径或上传静态包不会补齐这些能力。

---

## 日本語ガイド

### 1. プロジェクトの仕組み

フロントエンドは Next.js 15.2.0、React、App Router、バックエンドは Strapi 5 を使用します。ビルド時に CMS の内容を取得してページを生成し、`frontend/public/` のアセットとともに `frontend/out/` へ静的出力します。確認後の成果物は、必要に応じて `releases/` へ保存するか、静的サーバーに配置します。

ルートの `package.json` が共通の入口となり、対応するサブプロジェクトを作業ディレクトリとして実行します。

| ルートで実行するコマンド | 用途 |
| --- | --- |
| `npm run dev:backend` | Strapi 開発サーバー。現在のポートは 1337 |
| `npm run dev:frontend` | Next.js 開発サーバー。既定のポートは 3000 |
| `npm run build:backend` | Strapi 管理画面のビルド。静的フロントエンドの生成とは別 |
| `npm run build:frontend` | フロントエンドの `next build` と静的出力 |
| `npm run sync:uploads` | バックエンドのアセットをフロントエンドへコピー |
| `npm run preview` | `frontend/out/` のプレビュー。既定のポートは 3001 |
| `npm --prefix ./frontend run lint` | フロントエンドの既存の `next lint` を個別実行 |

フロントエンドには `start: next start` もありますが、現在の `output: 'export'` 構成では静的プレビューを使用します。読み込まれる設定は `frontend/next.config.js` です。現在の Next.js は `next.config.js`、`next.config.mjs`、`next.config.ts` の順で探すため、空の TS ファイルが JS の設定を上書きしたり、両者がマージされたりすることはありません。

### 2. 実行環境と依存関係

最初にルートで実行環境を確認します。

```powershell
node --version
npm --version
```

`backend/package.json` の Node.js 制約は `>=18.0.0 <=22.x.x` です。例えばこの範囲内の Node.js 22.x など、両側の依存関係を満たすバージョンを選びます。新しいバージョンだから互換性があるとは限りません。ネイティブ依存の `better-sqlite3` も Node.js のバージョンと一致させる必要があります。

既存の依存関係で正常に利用できれば起動へ進みます。初回、別の端末、Node.js の切り替え後には、ルートでそれぞれの依存関係をインストールします。各コマンドが成功してから次へ進んでください。

```powershell
npm --prefix ./backend ci
if ($LASTEXITCODE -ne 0) { throw 'バックエンドの依存関係をインストールできませんでした。' }
npm --prefix ./frontend ci
if ($LASTEXITCODE -ne 0) { throw 'フロントエンドの依存関係をインストールできませんでした。' }
```

**ローカルプラグインは追加の準備が必要です。** `frontend/package.json` とロックファイルには `next-ssg-asset-downloader` が未登録で、既存の `frontend/node_modules` には手動配置されたプラグインの `dist` だけがあります。`npm ci` は依存関係を作り直すため、現在のロックファイルだけではこのプラグインを復元できません。

不足している場合は、ルートから次の手順で準備します。依存関係のインストール、プラグインの `dist` の生成、フロントエンドへの登録を行い、フロントエンドの依存一覧とロックファイルを更新します。

```powershell
npm --prefix ./frontend/next-ssg-asset-downloader ci
if ($LASTEXITCODE -ne 0) { throw 'プラグインの依存関係をインストールできませんでした。' }
npm --prefix ./frontend/next-ssg-asset-downloader run build
if ($LASTEXITCODE -ne 0) { throw 'プラグインのビルドに失敗しました。' }
Push-Location -LiteralPath './frontend'
try {
    npm install './next-ssg-asset-downloader'
    if ($LASTEXITCODE -ne 0) { throw 'プラグインのインストールに失敗しました。' }
    node -e "require('next-ssg-asset-downloader/dist'); console.log('plugin import OK')"
    if ($LASTEXITCODE -ne 0) { throw 'プラグインを読み込めませんでした。' }
} finally {
    Pop-Location
}
```

プラグインは `node-fetch ^3.3.2` を宣言し CommonJS にコンパイルされますが、移動時に保持した手動配置版は実際には `node-fetch 1.7.3` を参照しています。再インストール後の構成は現在と異なります。`ERR_REQUIRE_ESM`、モジュール不足、コンパイルエラーが出た場合は、先に互換性を解決してください。再インストールと完全なビルドは、今回の文書更新時には実行・検証していません。

### 3. バックエンドの起動とデータ確認

専用ターミナルのルートで実行します。

```powershell
npm run dev:backend
```

現在のポートは `1337`、データベースは SQLite の `backend/.tmp/data.db` です。`backend/.env`、`backend/.tmp/data.db`、`backend/public/uploads/` を一組として保持します。現設定のために MySQL を新設する必要はありません。新しくクローンしたソースにはローカルデータは含まれないため、使用前に自分のバックアップから環境と内容を復元してください。

- 管理画面：[http://127.0.0.1:1337/admin](http://127.0.0.1:1337/admin)。既存の管理者アカウントを使用します。
- 管理画面で内容を編集・公開し、フロントエンドが必要とする公開読み取り操作を許可します。
- 主な API は `announcements`、`events`、`projects`、`publications`、`researchers` です。

別のターミナルで、お知らせ API を読み取り確認できます。

```powershell
$response = Invoke-RestMethod -Uri 'http://127.0.0.1:1337/api/announcements?populate=*'
$response.meta.pagination
```

HTTP 200 に加えて、公開済みデータ、ページネーションの件数、画像 URL も確認します。`401/403` では読み取り権限を確認してください。環境ファイル、データベース、管理者情報、秘密情報をフロントエンドの配布物に含めないでください。

多くのページの API アドレスは `http://127.0.0.1:1337` に固定されています。`NEXT_PUBLIC_API_URL` を参照するのは一部のイベント・シンポジウム詳細のみで、これだけでサイト全体の接続先は変更できません。HTTP アドレスはサービスの URL であり、ファイルパスではありません。リポジトリを移動してもローカルサービスのポートは変わらず、ビルド時のサーバー側通信には有効な完全な API URL が必要です。

### 4. 開発とアセットの準備

CMS を起動したまま、別のターミナルのルートでフロントエンドを起動します。

```powershell
npm run dev:frontend
```

[http://127.0.0.1:3000](http://127.0.0.1:3000) にアクセスします。開発設定は `/uploads/*` をポート `1337` へ転送しますが、`/api/*` のプロキシはありません。

ビルド前にリポジトリのスクリプトで `backend/public/uploads/` から `frontend/public/uploads/` へコピーします。まず `--dry-run` で予定を確認し、続いて実行します。新規ファイルの追加と同名ファイルの上書きを行い、フロントエンドだけにある他のファイルは削除しません。

```powershell
node ./scripts/sync-uploads.cjs --dry-run
if ($LASTEXITCODE -ne 0) { throw 'アセット同期の事前確認に失敗しました。' }
npm run sync:uploads
if ($LASTEXITCODE -ne 0) { throw 'アセット同期に失敗しました。' }
```

旧スクリプト `frontend/scripts/sync-images.js` は `/uploads/` が HTML の一覧を返すことを前提とし、小文字の `.jpg` と `.png` のみを処理します。WebP、PDF などを網羅せず、フロントエンドの npm scripts にも未登録のため、必須手順には含めません。

### 5. ビルドとアセット処理の順序

先にフロントエンドの開発ターミナルで `Ctrl+C` を押して `dev:frontend` を停止し、開発とビルドが `frontend/.next/` へ同時に書き込まないようにします。CMS は起動したまま、依存関係とアセットの準備後にルートで実行します。

```powershell
npm run build:frontend
if ($LASTEXITCODE -ne 0) { throw 'フロントエンドのビルドに失敗しました。ログを確認してください。' }
```

実装上の動作は次のとおりです。

1. `frontend/next.config.js` の `output: 'export'` により、成果物は `frontend/out/`、中間生成物は `frontend/.next/` に保存されます。
2. アセット取得プラグインは本番用のサーバー側 Webpack の `beforeCompile` で実行され、開発時は既定でダウンロードを省略します。
3. **ビルド開始前からある `frontend/out/` の HTML** を再帰走査し、アセットを `frontend/public/uploads/` に保存します。初回に旧 `out` がなければ警告のみで終了し、今回これから生成するページのアセットは発見できません。
4. プラグインの `htmlDir: 'out'` と `outputDir: 'public/uploads'` はフロントエンドの作業ディレクトリが基準です。`baseUrl` は `http://localhost:1337`、対象の接頭辞は `/uploads/`、既定の同時実行数は 5 です。URL の末尾のファイル名で保存し、同名ファイルは上書きします。共通コマンドはフロントエンド内で実行するため、ルートで直接 `next build` を呼んで代用しないでください。
5. Next.js が CMS を参照してページと静的詳細を生成し、`frontend/public/` もコピーします。例えば `frontend/public/uploads/a.jpg` は `frontend/out/uploads/a.jpg` になります。
6. プラグインは **HTML/JS の URL を書き換えず**、`releases/` へのアーカイブも行いません。一部のパスの相対化はページ側で行いますが、ローカルの絶対 URL が残っていないか確認が必要です。

既定の対象は `.jpg/.jpeg/.png/.gif/.webp/.svg/.mp4/.mp3/.pdf/.zip` です。CSS の `url()`、`srcset`、実行時 JavaScript/RSC の参照は走査しません。個別の失敗は通常ログに記録されるだけで、ビルド全体は止まりません。ビルドの繰り返しや成功表示だけで完全性を判断しないでください。README の「ビルド完了後に走査」は現在の実装とはタイミングが異なります。

`images.unoptimized: true` のため Next.js の画像最適化サーバーは不要です。`productionBrowserSourceMaps` は実際には `true` で、隣のコメントに反して無効化されていません。TypeScript と ESLint のビルド停止チェックも無効であり、成功しても型・ルール・全機能の検証完了を意味しません。

`npm run build:backend` は Strapi 管理画面用です。フロントエンドのビルドを代替せず、データベースやアップロードファイルも梱包しません。

### 6. 内容更新と詳細ルート

静的サイトの CMS 内容はビルド時点のものです。内容や画像の更新後は同期、再ビルド、再公開が必要です。`revalidate: 3600` は、出力済みの静的ファイルを毎時更新する機能にはなりません。

| ページのソース（ルートからの相対パス） | 現在の詳細生成方法 |
| --- | --- |
| `frontend/app/news/announcements/[slug]/page.tsx` | API から slug を取得。ただしページネーション未対応で、既定は 1 ページ 25 件 |
| `frontend/app/news/events/[slug]/page.tsx` | `event`、`event-1` から `event-10` を固定指定 |
| `frontend/app/symposium/[slug]/page.tsx` | `event`、`event-1` から `event-5` を固定指定 |
| `frontend/app/studies/projects/[slug]/page.tsx` | `valuing-air-project`、`ushita-arts-initiative`、`project-1`、`project-2` を固定指定 |

CMS に追加するだけでは詳細ファイルの生成は保証されません。固定リストやお知らせの取得件数を超える場合は、先に `generateStaticParams` の処理またはリストを更新してからビルドします。

### 7. 今回の静的出力をプレビューする

ビルド成功後、ルートでリポジトリのプレビューを起動します。

```powershell
npm run preview
```

既定の配信対象は `frontend/out/` です。[http://127.0.0.1:3001](http://127.0.0.1:3001) にアクセスし、`Ctrl+C` で停止します。`/about` を `/about.html` に解決するなど、拡張子のないパスに対応します。ローカル確認用であり、外部の過去の出力や旧スクリプト、フロントエンドの `next start` は不要です。

トップページ、各詳細、画像、添付ファイル、詳細 URL への直接アクセスと再読み込みを確認します。ビルド後に CMS を停止すると、主要な静的ページがまだローカル CMS に依存していないか確認できます。検索の制約は第 9 節に記載します。

### 8. アーカイブと公開

ビルドは `releases/` へ自動保存しません。配布版を保存する場合、ルートで次の任意手順を実行し、新しい版のディレクトリと ZIP を作ります。既存の版は上書きしません。`releases/` は Git のコミット対象外です。

```powershell
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath './frontend/out/index.html' -PathType Leaf)) {
    throw '静的トップページがありません。先に frontend/out をビルドして確認してください。'
}
$releaseDir = Join-Path './releases' ('out_' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
if ((Test-Path -LiteralPath $releaseDir) -or (Test-Path -LiteralPath ($releaseDir + '.zip'))) {
    throw '保存先が既に存在します。別の名前を使用してください。'
}
New-Item -ItemType Directory -Path $releaseDir | Out-Null
Get-ChildItem -LiteralPath './frontend/out' -Force |
    Copy-Item -Destination $releaseDir -Recurse -Force
Compress-Archive -LiteralPath $releaseDir -DestinationPath ($releaseDir + '.zip')
```

ZIP には版のディレクトリが 1 階層含まれます。その中の `index.html` がある場所を公開サイトのルートとし、`_next`、`uploads`、画像、サブディレクトリ全体を配置します。HTML だけでは動作しません。静的サーバーは `/about` を `/about.html` に解決する設定が必要です。未生成の詳細は 404 とし、トップページの一律返却で欠落を隠さないでください。

配布するのは確認済みの静的成果物だけです。`backend/`、`.local/`、依存関係やリポジトリ全体をフロントエンドの配布物として公開しないでください。

### 9. 既知の制約と確認箇所

| 症状 | 確認箇所 |
| --- | --- |
| `next-ssg-asset-downloader/dist` がない | プラグイン、`dist`、フロントエンドの依存一覧。現ロックファイルだけでは手動プラグインを復元できない |
| CMS 通信失敗、空の一覧、仮の内容 | ポート 1337、公開状態、読み取り権限、API アドレス、ページネーション。一部は代替内容を返す |
| 新しい詳細が 404 | `generateStaticParams`、固定 slug、お知らせのページネーション、`frontend/out/` の詳細ファイル |
| 画像・添付ファイルがない | `backend/public/uploads/`、`frontend/public/uploads/`、`frontend/out/uploads/`。旧 HTML は全新規アセットを網羅しない |
| CMS 更新が反映されない | 同期、再ビルド、再公開。静的ファイルはサーバー側の定期再検証を実行しない |
| 古い版が表示される | 今回のビルドの成功、配信対象 `frontend/out/`、ブラウザーの再読み込み |
| 検索が動かない | `frontend/app/search/SearchClient.tsx` が同一オリジンの `/api/*` を呼ぶが、開発・静的プレビューともにプロキシがない |

検索は一部を `item.attributes` から読み、プロジェクトと研究員のリンクを実際の構成と異なる `/projects/`、`/researchers/` に生成します。提供するには Strapi 5 の形式を確認し、リンクを修正し、同一オリジンの API プロキシまたは静的検索を実装する必要があります。ディレクトリ移動、ファイルパスの相対化、静的ファイルの公開だけでは解決しません。

---

## 核对依据 / 確認に使用したファイル

以下均为仓库根目录相对路径。  
以下はすべてリポジトリのルートからの相対パスです。

- `package.json`、`scripts/preview-static.cjs`、`scripts/sync-uploads.cjs`：统一命令、预览、资源复制 / 共通コマンド、プレビュー、アセットコピー
- `frontend/package.json`、`frontend/package-lock.json`：前端版本与依赖 / フロントエンドのバージョンと依存関係
- `frontend/next.config.js`、`frontend/next.config.ts`：导出、代理、插件配置 / 出力、プロキシ、プラグイン設定
- `frontend/next-ssg-asset-downloader/src/index.ts`、`frontend/node_modules/next-ssg-asset-downloader/dist/index.js`：插件行为 / プラグインの実装
- `frontend/node_modules/next/dist/shared/lib/constants.js`、`frontend/node_modules/next/dist/server/config.js`：Next.js 配置查找 / 設定ファイルの選択
- `frontend/node_modules/next/dist/export/index.js`：静态导出与公开资源复制 / 静的出力と公開アセットのコピー
- `frontend/scripts/sync-images.js`：旧同步脚本 / 旧同期スクリプト
- `frontend/app/components/Carousel.tsx`、`frontend/app/components/Projects.tsx`、`frontend/app/components/PublicationsPreview.tsx`：构建时 CMS 请求 / ビルド時の CMS 参照
- `frontend/app/news/announcements/[slug]/page.tsx`、`frontend/app/news/events/[slug]/page.tsx`、`frontend/app/symposium/[slug]/page.tsx`、`frontend/app/studies/projects/[slug]/page.tsx`：静态详情路由 / 静的詳細ルート
- `frontend/app/search/SearchClient.tsx`：浏览器端搜索 / ブラウザー側の検索
- `backend/package.json`、`backend/config/server.ts`、`backend/config/database.ts`、`backend/config/api.ts`：后端命令、端口、数据库、分页 / バックエンドのコマンド、ポート、DB、ページネーション
- `.gitignore`、`frontend/.gitignore`、`backend/.gitignore`：源码与本地数据的提交范围 / ソースとローカルデータのコミット範囲
