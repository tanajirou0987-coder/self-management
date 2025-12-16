# private_keyの正しい形式

## 🔍 問題

JSONファイルからコピーした`private_key`には、実際の改行が含まれている可能性があります。

**JSONファイル内の形式**:
```
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDvAvmu039ZcVHn\nuOQFmFOqzBKtGFTeD4TGJ3wlIiQ9SZ9oUHPGe2ht6BVfw2ECPIPz45i0NqXg0tsf\n..."
```

JSONファイルを開くと、実際の改行として表示される場合がありますが、**環境変数には`\n`という文字列として保存する必要があります**。

## ✅ 正しい形式

環境変数に設定する際は、以下の形式にする必要があります：

```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDvAvmu039ZcVHn\nuOQFmFOqzBKtGFTeD4TGJ3wlIiQ9SZ9oUHPGe2ht6BVfw2ECPIPz45i0NqXg0tsf\nZq8/dz60gyCr6/lctNNTQ4rPf1cN4xdChrZdPekks1e0Nqq+fVoRv5dyInFXZ6aa\nLjJwWuNFvddHLvv9H9/umRX6rGPCsguO2s1GnWvvWRMPwrW0cg2KQkIZRsMmcHA7\nbwfO3jUBQpDP65aDllYuA6POg80F5KzJE33CHPcHWxLTb1vJDaxfG3t3sCS7tWVV\nt+O0le9tToUz5qx47vzcEvVztjk4QqpcF3he93lnkB/RDH4CnTCt3KUPogXOU24y\ndi+7vU1BAgMBAAECggEACEqYoc15ef9Z4YmC84S8xkyNC08wRoHQT9V304vzKOMg\ncgx0b7rBPSrTbv6Go3647yGCnyHUME/wRQ8ZXkDDPpzb6crmXCZzvEw4CQm4WeV6\nXZbxxZtLtre3/6rz0mbj1IDKfq2eM/OHDosyub4Va0pyKOiC2l2cNZk+73LChTL5\n1QHr8rmMP0C3YmFGC3YAaexVK6yMEFkov3VSGgo+L6I+G7WARhcPvUYf1RxFNh/L\nsvZZazuqCS/8gfSYA3+5EsF5Y/ieDlIYyK/IoBp2hkG/3sUw+RCFJAaeBAcG1Sos\nR7+W0iwQ3uKBC2NyVBSdVFbkUkIelKfNiSpbDliFSQKBgQD5N3WWamEt7NTaii5q\nByie7qcQDN3JN4caXYv50Yu0WqbWY6Xg0wTDzTXTzUpDWbj+zw3jMPaheRqvRBV2\npPzvXSCVI6nPTlR3wzohfEepjE+SJ25QsQZe5x9REHzaCAQTlz4u5nK5WTJrCqAX\nqaev4RUzGNxBmuPdziALEsPOxQKBgQD1hGhQ2tQIUj4cXEsAGEDVBw6Ln1SuY6eC\nRl+kRa+2GB5ueoENgkBnuHrQJbI16KMOrCcA6aU0v7zKta48vA0SFKqnjxVc7Bg7\nWRzxPm6+gcKjCv/Y6K0yTe8wj3jIR9V7PyYhPhdL6bpxDqiPnOupHdPQMda7KW1n\nLutQxvlsTQKBgQDyAMDWx4aGqiwn63cWzszLSMRB+byE4L75A04h0THwePb5yNoT\nb9Z4rJVQj1FGBaJ3DWlW7P0R4B/hgiO1ipFzfuNc77y96jpr8dBJI/4SzoWWT2P4\nR28AST9H4NLchlwvCfcAZBeTlOI4v6CmWcDUMaX8cG+x5U7Q3JCRMC+kYQKBgCjW\ndleEnqIns+cZvuvsHNSSUOwOe5JqRxGXTQ9Q/BIo3t73h4HMuZPHDr6Slpr68Cxf\nnDk9o9orTmbVY378tJveTiiC10XWi41LnFHQVbFgehSOntHgmfZ1GiUUqD2AHVVb\nwqbi4hMhdH6btpP0wQonSPUnZRVKpcT0+/U6s4A9AoGBAKOV2OuepHQXxRLQ/t1g\nzi2PJFtR7cAw3ftL9TRtthzwE9PDSVQS33zFqIutTQZUJK5AOgNuSwprfjsc30gr\nSX0w47CUKlSjFu1/JMCbRYA4xBJ7YYR2Mu15e4yW0/MctDQE1/UacLmZUOR7Whvu\n+KlrBdI+XSSjJi8aaxebhSLH\n-----END PRIVATE KEY-----\n
```

## 🔧 設定方法

### 方法1: JSONファイルから直接コピー（推奨）

1. JSONファイルをテキストエディタで開く
2. `private_key`フィールドの値をコピー
   - JSONファイル内では`\n`として保存されているので、そのままコピーすればOK
3. `vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production`を実行
4. コピーした値を貼り付けてEnter

### 方法2: 実際の改行を`\n`に変換

もし実際の改行が含まれている場合：

1. テキストエディタで`\n`に置換
   - 検索: 実際の改行
   - 置換: `\n`
2. または、以下のコマンドを使用（Mac/Linux）:
   ```bash
   # JSONファイルからprivate_keyを抽出して、改行を\nに変換
   cat your-service-account.json | jq -r '.private_key' | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$//'
   ```

## ⚠️ 注意事項

- **前後のダブルクォート（`"`）は含めない**
- **余分なスペースを追加しない**
- **値が完全か確認する**（途中で切れていないか）
- **`-----BEGIN PRIVATE KEY-----`から`-----END PRIVATE KEY-----`まで全体を含める**

## 🔍 確認方法

環境変数を設定した後、デプロイして確認：

```bash
curl https://self-management-app.vercel.app/api/google/debug
```

`{"configured":true}` と表示されれば成功です。


