# Supabase 同期設定ガイド

このガイドでは、自己管理アプリと Supabase を連携させ、データをクラウドに保存・同期するための手順を詳しく解説します。

## 1. Supabase プロジェクトの準備

まだ Supabase プロジェクトがない場合は作成してください。

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセスし、「New Project」をクリックします。
2. Name（例: `self-management-app`）、Database Password、Region（例: `Tokyo`）を入力して「Create new project」をクリックします。
3. プロジェクトの作成が完了するまで数分待ちます。

## 2. 環境変数の設定

アプリが Supabase に接続するための「鍵」を設定します。

1. Supabase ダッシュボードの左メニューから **Settings (歯車アイコン)** > **API** を開きます。
2. **Project URL** と **Project API keys (anon / public)** の値をコピーします。
3. アプリの `app` ディレクトリ直下に `.env.local` ファイルを作成します（既にある場合は追記）。

**ファイルパス**: `app/.env.local`

```bash
# Supabase 接続情報
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> [!IMPORTANT]
> `.env.local` を変更した後は、必ず開発サーバー (`npm run dev`) を再起動してください。再起動しないと変更が反映されません。

## 3. データベース（テーブル）の作成

データを保存する「箱」を作ります。Supabase の SQL Editor を使うと一発で作成できます。

1. Supabase ダッシュボードの左メニューから **SQL Editor** を開きます。
2. 「New query」をクリックし、以下の SQL を貼り付けます。

```sql
-- ダッシュボードのスナップショット（1日分のデータ）を保存するテーブル
create table if not exists dashboard_snapshots (
  date text primary key,       -- 日付 (YYYY-MM-DD) をIDとして使用
  payload jsonb not null,      -- 予定・タスクなどのデータをJSON形式で丸ごと保存
  updated_at timestamp with time zone default now() -- 更新日時
);

-- 行レベルセキュリティ (RLS) の設定（今回は個人利用のため簡易的に全許可、または無効化）
-- ※ 本格運用時は適切なポリシーを設定してください
alter table dashboard_snapshots enable row level security;

create policy "Enable all access for anon users" on dashboard_snapshots
  for all using (true) with check (true);
```

3. 右下の **Run** ボタンをクリックして実行します。「Success」と表示されればOKです。

## 4. 動作確認

設定が正しいか確認しましょう。

1. ターミナルで開発サーバーを再起動します。
   ```bash
   npm run dev
   ```
2. ブラウザで `http://localhost:3000` を開きます。
3. 適当なタスクを追加したり、振り返りを入力したりして、画面上のデータを変更します。
   - この時点で、裏側で `persistSnapshot()` という関数が動き、Supabase にデータが送信されます。
4. Supabase ダッシュボードの **Table Editor** を開き、`dashboard_snapshots` テーブルを確認します。
5. `date` カラムに今日の日付、`payload` カラムにデータが入ったレコードが増えていれば同期成功です！

## トラブルシューティング

- **データが保存されない場合**:
    - ブラウザのコンソール（F12キー > Console）を確認してください。
    - `Supabase credentials are missing...` と出ている場合 → `.env.local` の設定ミスか、サーバー再起動忘れです。
    - `Failed to save snapshot to Supabase` と出ている場合 → ネットワークエラーや、Supabase 側のテーブル作成ミスの可能性があります。

- **既存のデータが消えた？**:
    - このアプリは「Supabase 上のデータ」を正として読み込みます。Supabase が空で、ローカル（ブラウザ）にデータがある場合、初回はローカルのデータが表示されますが、一度 Supabase に保存されると次回からはそれが優先されます。
