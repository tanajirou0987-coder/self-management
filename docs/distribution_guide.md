# アプリの配布方法ガイド

このアプリを「完成品」として配布するための方法を説明します。

## 🎯 配布方法の選択肢

### 1. PWAとして配布（現在の方法）

**メリット:**
- すぐに利用可能
- App Store/Google Playの審査不要
- 更新が即座に反映される

**デメリット:**
- URLを知っている必要がある
- インストール手順が分かりにくい場合がある

**改善策:**
- ✅ QRコード生成機能を追加（実装済み）
- ✅ インストールプロンプトを追加（実装済み）

### 2. Capacitorでネイティブアプリ化（推奨）

**メリット:**
- App Store/Google Playに公開可能
- より正式な配布方法
- ネイティブ機能（プッシュ通知など）が利用可能

**デメリット:**
- アプリストアの審査が必要
- 更新の反映に時間がかかる

## 📱 Capacitorを使ったネイティブアプリ化

### セットアップ手順

1. **ビルドと同期**
   ```bash
   npm run build
   npm run cap:sync
   ```

2. **iOSアプリの作成**
   ```bash
   npm run cap:ios
   ```
   - Xcodeが開きます
   - プロジェクトを開いて、署名と証明書を設定
   - ArchiveしてApp Storeに提出

3. **Androidアプリの作成**
   ```bash
   npm run cap:android
   ```
   - Android Studioが開きます
   - プロジェクトを開いて、署名キーを設定
   - Build → Generate Signed Bundle/APK
   - Google Play Consoleに提出

### App Store/Google Playへの公開

#### iOS (App Store)

1. **Apple Developerアカウントが必要**（年間$99）
2. XcodeでArchive → App Store Connectにアップロード
3. App Store Connectで審査申請

#### Android (Google Play)

1. **Google Play Consoleアカウントが必要**（$25の初回登録料）
2. AABファイルをアップロード
3. ストアリスティング情報を入力
4. 審査申請

## 🔗 QRコードでの簡単アクセス

ダッシュボード右上の「QRコード」ボタンをクリックすると、現在のURLのQRコードが表示されます。

**使い方:**
1. PCやタブレットでアプリを開く
2. 「QRコード」ボタンをクリック
3. スマホのカメラでQRコードをスキャン
4. 自動的にアプリにアクセス

## 🚀 完成品として配布するためのチェックリスト

### 必須項目

- [x] PWA設定（manifest.json, Service Worker）
- [x] 認証機能（本人のみアクセス可能）
- [x] QRコード生成機能
- [x] インストールプロンプト
- [x] レスポンシブデザイン（スマホ対応）
- [x] オフライン対応（Service Worker）

### 推奨項目

- [ ] App Store/Google Playへの公開（Capacitor使用）
- [ ] カスタムドメインの設定（Vercel Pro）
- [ ] アナリティクスの追加（Google Analytics等）
- [ ] エラートラッキング（Sentry等）

## 📋 配布方法の比較

| 方法 | 難易度 | コスト | 審査 | 更新速度 |
|------|--------|--------|------|----------|
| PWA | ⭐ | 無料 | 不要 | 即座 |
| Capacitor (iOS) | ⭐⭐⭐ | $99/年 | 必要 | 数日 |
| Capacitor (Android) | ⭐⭐ | $25 | 必要 | 数日 |

## 🎨 カスタムドメインの設定（オプション）

Vercel Pro（$20/月）を使用すると、カスタムドメインを設定できます。

1. Vercelダッシュボード → Settings → Domains
2. ドメインを追加
3. DNS設定を更新

例: `self-management.yourdomain.com`

## 📝 次のステップ

1. **すぐに配布したい場合**: QRコード機能を使って配布
2. **正式に配布したい場合**: Capacitorでネイティブアプリ化
3. **ブランド化したい場合**: カスタムドメインを設定

現在の実装では、QRコード機能により簡単にアクセスできるようになっています。ネイティブアプリ化が必要な場合は、上記の手順に従って進めてください。

