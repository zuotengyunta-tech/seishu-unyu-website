# 勢州運輸有限会社 ホームページ

静的なHTML・CSS・JavaScriptで構成されたホームページです。

## ファイルの編集場所
- `index.html` — トップページ
- `transport.html` — 事業案内
- `network.html` — 営業所・輸送エリア
- `company.html` — 会社情報
- `careers.html` — 採用情報
- `news.html` — お知らせ
- `contact.html` — お問い合わせ
- `assets/style.css` — サイト全体の見た目
- `assets/site.js` — メニュー・写真切替・お問い合わせフォーム
- `assets/` — 写真、ロゴ、フォント

## ローカルでの確認
フォルダー内の `index.html` をブラウザーで開きます。保存後、再読み込みして変更を確認できます。

## GitHubへのアップロード
ZIPを展開後、**このREADMEとindex.htmlが存在する階層のファイル・assetsフォルダーをまとめて**リポジトリのルートにアップロードしてください。ZIPをファイルとしてアップロードするだけでは、GitHub上でHTMLを直接編集できません。

## GitHub Pages（任意）
リポジトリの Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save で公開できます。
GitHub Pagesの公開URLは従来のChatGPT SitesのURLとは別です。

## 注意事項
- この配布版では既存の `.openai/hosting.json` を含めていません。既存のChatGPT Sitesへの更新連携を保証するものではありません。
- 既存HTMLにはChatGPT SitesのURLを指定したcanonical/OGメタ情報が残っています。GitHub Pagesを正式な公開先にする場合は、そのURLの見直しが必要です。
- お問い合わせはメールソフトを開く形式で、サーバー送信機能はありません。
- 写真・フォント等の公開・再配布権限は、公開リポジトリにする前に確認してください。出典は `SOURCES.md` を参照してください。
