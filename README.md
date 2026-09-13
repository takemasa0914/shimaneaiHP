# 島根AIハッカソン2026

2026年12月19日（土）／ENUN（松江）で開催する学生向け1DAYハッカソンのLPです。チラシの青・ターコイズ・黄色を採用し、学生向け参加申込と企業・団体向け参加／関心登録を同じページに実装しています。

公開URL: https://shimane-ai-hackathon-2026.takemasa.chatgpt.site

## 運営者向け

- 学生申込は `student_applications`、企業・団体の登録は `business_registrations` に保存します。
- 応募情報は公開ページ/APIから閲覧できません。サイトの設定にあるデータベースビューアから確認できます。このChatGPTプロジェクトで「学生の申込一覧」「企業の登録一覧をCSVで」と依頼して確認・書き出しすることもできます。
- `participation` は `attend`（当日の参加希望）または `interest`（関心登録）です。`interests` は関わり方、`areas` は関心分野です。
- `updates_opt_in = 1` の方が今後の活動案内を希望しています。今回の受付連絡への同意とは分けて保存しています。
- 受付後は画面に受付番号を表示します。自動返信メール・運営者へのメール通知は実装していません。受付結果を確認して、主催者から連絡してください。
- 申込を参加確定扱いにはしていません。定員は約10名。選考条件や募集締切は未設定で、自動的には締め切りません。
- 開催日・会場・無料・賞金は添付チラシを基準にしています。開始終了時刻、審査員、持ち物の確定情報は未提供のため後日案内としています。
- 個人情報の訂正・削除依頼は本人確認後に対応してください。サイトで示した保管方針に沿って不要な情報を削除してください。

## 更新箇所

- `app/page.tsx`: 掲載内容、開催概要、プログラム
- `app/registration.tsx`: 2種類のフォーム、FAQ、個人情報の説明
- `app/globals.css`: レスポンシブデザイン
- `lib/registration-schema.ts`: 入力項目・検証・同意文面のバージョン
- `app/api/register/route.ts`: 匿名で利用可能な書き込み専用受付API
- `db/schema.ts`, `drizzle/`: Cloudflare D1のスキーマと適用するマイグレーション

## ソース管理・公開

GitHub `takemasa0914/shimaneaiHP` の `hackathon-2026-lp` ブランチで独立したアプリとして管理します。既存HPのmainブランチとは別です。公開先はChatGPT Sitesです。GitHubへの変更だけでは自動公開されません。更新時はこのブランチを修正し、Sites側のソースにも同じ内容を反映してビルド・公開してください。

Node.js >=22.13、pnpm（package.jsonのpackageManagerのバージョン）を使用します。`pnpm install --frozen-lockfile` の後、`pnpm dev`、`pnpm build`。ChatGPT Work内ではSitesスキルの設定・ビルド・公開手順を使用してください。

`pnpm exec tsc --noEmit` で型を確認し、`node --test tests/registration.test.mjs` で検証・SQLiteへの保存・重複防止・失敗時の応答を検証できます。テストデータは一時的なローカルDBだけに保存します。

本番データはGitHubへ含めません。ソースには秘密情報を含めません。リクエストIDによる再送時の重複防止、サーバー側検証、本文サイズ制限、ハニーポット、Origin確認、IPの一方向ハッシュを使用する短期送信制限を実装しています。IPハッシュは受付回数管理だけに使用し、生のIPを保存しません。

## 画像

`public/flyer.jpeg`: ユーザー提供の企画チラシ。
`public/hero.webp`: チラシを参考に生成したプロモーション用のイメージ。実在の会場・開催実績を示す写真ではありません。

会場情報の参照: https://enun.jp/
