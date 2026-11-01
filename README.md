# 早稲田大学漢学研究所 / Waseda Han Studies

Next.js 前端和 Strapi 后端的本地统一仓库。下面的路径和命令均以仓库根目录为基准。  
Next.js フロントエンドと Strapi バックエンドをまとめたリポジトリです。以下のパスとコマンドはリポジトリのルートを基準にしています。

```text
.
├── frontend/                 # Next.js
│   ├── app/
│   ├── public/
│   ├── next-ssg-asset-downloader/
│   └── BUILD_AND_USAGE_ZH_JA.md
├── backend/                  # Strapi
├── scripts/                  # 相对路径工具 / 相対パスのツール
├── releases/                 # 本地交付包，忽略 / ローカル配布物、Git 対象外
└── .local/                   # 原 Git 历史与旧数据备份，忽略 / 旧履歴とデータ、Git 対象外
```

## 使用 / 利用方法

使用 Node.js 22.x；前后端依赖分别管理，根目录无依赖需要安装。详细的首次安装、插件依赖和已知限制请先阅读 [中日双语使用说明](frontend/BUILD_AND_USAGE_ZH_JA.md)。  
Node.js 22.x を使用してください。依存関係はフロントエンドとバックエンドで個別に管理し、ルートでのインストールは不要です。初回導入、プラグイン依存関係、既知の制約は [中国語・日本語ガイド](frontend/BUILD_AND_USAGE_ZH_JA.md) を先に確認してください。

```powershell
# 依赖缺失时 / 依存関係がない場合
npm --prefix ./backend ci
npm --prefix ./frontend ci

# 终端 1 / ターミナル 1
npm run dev:backend

# 终端 2，开发时 / ターミナル 2、開発時
npm run dev:frontend
```

打包时停止前端开发服务，保持 CMS 运行：  
ビルド時はフロントエンドの開発サーバーを停止し、CMS は起動したままにします。

```powershell
npm run sync:uploads
npm run build:frontend
npm run preview
```

静态预览地址：[http://127.0.0.1:3001](http://127.0.0.1:3001)。  
静的プレビュー：[http://127.0.0.1:3001](http://127.0.0.1:3001)。

## 本地数据与 Git / ローカルデータと Git

后端的 `backend/.env`、`backend/.tmp/` 和 `backend/public/uploads/` 已随项目保留在本机，均排除在 Git 之外。新机器需要单独准备配置、数据库和上传资源，克隆源码本身不会恢复现有 CMS 内容。`backend/.env.example` 是可提交的配置模板。  
`backend/.env`、`backend/.tmp/`、`backend/public/uploads/` はローカルに保持し、Git から除外しています。別の端末では設定、DB、アップロードファイルを別途準備してください。ソースのクローンだけでは既存の CMS コンテンツは復元されません。`backend/.env.example` は共有可能な設定テンプレートです。

原前端 Git 历史包含运行数据库，因此完整保存为 `.local/legacy-frontend-git/`，不导入此仓库的新历史。原内嵌后端保存在 `.local/legacy-backend/`；旧前端构建缓存保存在 `.local/frontend-next-before-move/`。原工作区修改和迁移记录也保存在 `.local/`。这些备份只供本机恢复，不能加入上传范围。  
旧フロントエンドの Git 履歴には実行用 DB が含まれているため、`.local/legacy-frontend-git/` に全体を保存し、新しい履歴には取り込んでいません。旧内蔵バックエンドは `.local/legacy-backend/`、旧ビルドキャッシュは `.local/frontend-next-before-move/` に保存しています。元の差分と移行記録も `.local/` にあります。これらはローカル復元用で、アップロードの対象にはしません。

此步骤仅整理本地仓库，尚未配置或推送 GitHub 远程。  
この段階ではローカルリポジトリのみを整理しており、GitHub のリモート設定・プッシュは行っていません。
