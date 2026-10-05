# Crossover 企業交流会 Webシステム

犬山で開催される「クロスオーバー」企業交流会向けのWebシステムです。

会場のQRコードから参加者が企業・担当者プロフィールを登録し、参加企業を検索・閲覧できる仕組みを提供します。

## 技術スタック

- Next.js 16.3.8
- React 19.3
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM 7
- Vercel Blob（Public）
- Vercel

## 現在実装済み

### 参加者側

- 交流会一覧
- 交流会トップ
- 新規企業登録
- 担当者登録
- 顔写真登録
- Vercel BlobへのClient Upload
- 参加企業一覧
- 企業名・担当者名・事業内容検索
- 業界フィルター
- 企業詳細
- 交流会ごとの参加担当者表示

### 次の実装候補

- 既存企業の再参加
- 再登録キー
- プロフィール編集
- ユーザーによる業界追加
- 管理画面
- CSV出力
- QRコード生成

## ローカル起動

1. 依存関係をインストール

    npm install

2. .env.example をコピーして .env を作成

3. PostgreSQLの接続URLを DATABASE_URL に設定

4. Prisma Clientを生成

    npm run db:generate

5. DBマイグレーション

    npm run db:migrate -- --name init

6. 初期データ投入

    npm run db:seed

7. 開発サーバー起動

    npm run dev

## Vercel Blob

Vercel ProjectのStorageからBlob Storeを作成し、AccessをPublicに設定します。

Projectへ接続すると BLOB_READ_WRITE_TOKEN が環境変数として設定されます。

担当者の顔写真はBlobへ保存し、PostgreSQLには画像URLだけを保存します。

## Vercelデプロイ

Vercel側で最低限以下を設定します。

- DATABASE_URL
- BLOB_READ_WRITE_TOKEN

DBのマイグレーションは本番反映前に実行してください。

## 設計書

設計資料は [設計](./設計/) フォルダーにまとめています。

- [00_設計書一覧](./設計/00_設計書一覧.md)
- [01_要件定義書](./設計/01_要件定義書.md)
- [02_システム設計書](./設計/02_システム設計書.md)
- [03_画面設計書](./設計/03_画面設計書.md)
- [04_DB設計書](./設計/04_DB設計書.md)
- [05_業務フロー設計書](./設計/05_業務フロー設計書.md)
- [06_管理画面設計書](./設計/06_管理画面設計書.md)
- [07_権限・セキュリティ設計書](./設計/07_権限・セキュリティ設計書.md)
- [08_運用設計書](./設計/08_運用設計書.md)
- [09_未確定事項](./設計/09_未確定事項.md)
- [10_技術スタック](./設計/10_技術スタック.md)
