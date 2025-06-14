# BizenDAO Background Lambda システム仕様書

## 概要

BizenDAO Background Lambda（bizbg）は、Discord コミュニティ管理を自動化するAWS Lambda関数です。Discord サーバーのメンバー情報を DynamoDB と Notion データベースに同期し、コミュニティ運営を効率化します。

## システム目的

- **メンバー同期**: Discord メンバー情報の DynamoDB・Notion への自動同期
- **Discord メッセージング**: Discord チャンネル・DM への自動メッセージ送信
- **NFT 統合**: NFT 関連操作と通知の処理
- **データ管理**: プラットフォーム間でのメンバーデータの一元管理

## アーキテクチャ

### システム構成

```
SQS Queue → AWS Lambda Handler → Controller → Services → External APIs
                                      ↓
                              Models ← Database Operations
```

### 設計パターン

- **イベント駆動型**: SQS キューからのメッセージ処理
- **サービス指向**: 各統合サービスのモジュール化
- **モデルベース**: メンバー管理の中央集権化
- **マルチ環境**: local/staging/production/flow 環境対応

## コンポーネント仕様

### 1. Model Layer (`model/`)

#### `members.ts`
メンバーデータの中核モデル

**主要機能:**
- Discord ↔ データベース同期ロジック
- ソフトデリート機能
- メンバーデータの表示フォーマット
- バッチ更新操作（追加/更新/削除カウンター付き）

**主要メソッド:**
```typescript
// メンバー同期
syncMembers(discordMembers: DiscordMember[], dbMembers: DbMember[]): SyncResult

// データ表示
displayMembers(members: Member[]): string

// バッチ操作
batchUpdate(operations: BatchOperation[]): BatchResult
```

### 2. Service Layer (`service/`)

#### `controller.ts`
サービス間の調整を行う主要オーケストレーション層

**主要機能:**
- Discord ↔ DynamoDB 同期管理
- Discord ↔ Notion 同期管理
- SQS メッセージ送信管理
- テスト・開発用インターフェース提供

#### `discord.ts`
Discord API 統合サービス

**主要機能:**
- ギルドメンバーの取得（ページネーション・レート制限対応）
- チャンネルメッセージ・DM 送信
- Discord ロールマッピング・アバター管理
- カスタムロール設定システム

**設定:**
- レート制限: API 呼び出し間隔制御
- ページネーション: 大量メンバー対応
- ロールマッピング: `customSettings.ts` による設定

#### `dynamo.ts`
DynamoDB サービス層

**主要機能:**
- 完全な CRUD 操作（作成・読み取り・更新・削除）
- ページネーション付きテーブルスキャン
- フィルタリング付きクエリ操作
- エラーハンドリング・ログ出力

**テーブル設計:**
- パーティションキー: `PartitionName`
- ソートキー: `DiscordId`
- ソフトデリート対応

#### `notion.ts`
Notion API 統合サービス

**主要機能:**
- ページネーション付きデータベースクエリ
- リトライロジック付きページ作成・更新
- ロール・アイコン管理によるメンバー同期
- バッチ操作追跡

**特徴:**
- 自動リトライ機能
- アイコン管理（Discord アバター連携）
- 退出ステータス追跡

#### `sqs.ts`
SQS メッセージ送信サービス

**主要機能:**
- 設定済み SQS キューへのメッセージ送信
- 基本的なエラーハンドリング

### 3. Types Layer (`types/`)

#### `message.ts`
SQS 通信用メッセージインターフェース定義

#### `crud.ts`
DynamoDB テーブルスキーマと操作テンプレート

#### `notionMember.ts`
メンバー操作用 Notion ページ構造テンプレート

### 4. Common Layer (`common/`)

#### `const.ts`
環境変数による中央設定管理

#### `customSettings.ts`
Discord ロール ID から名前へのマッピング設定

#### `util.ts`
ユーティリティ関数（sleep、ログ出力など）

## エントリーポイント

### `index.ts` (本番環境 Lambda ハンドラー)

SQS メッセージを処理するメイン AWS Lambda ハンドラー

**サポート機能:**
- `notion-sync`: Discord メンバーの Notion データベース同期
- `dynamo-sync`: Discord メンバーの DynamoDB 同期
- `discord-message`: Discord チャンネルへのメッセージ送信
- `discord-direct-message`: Discord DM 送信
- `nft-getkey`: NFT キー取得と通知処理

### `develop.ts` (開発・テスト用エントリーポイント)

個別コンポーネントのテスト用開発スクリプト

## 環境設定

### 必要な環境変数

#### 基本設定
```env
API_ENV=LOCAL          # 環境識別子
API_URL=               # ベース API URL
SERVER_INFO=           # サーバー識別情報
VERSION=               # 自動生成タイムスタンプバージョン
```

#### Discord 統合
```env
DISCORD_BOT_KEY=       # Discord ボットトークン
DISCORD_GUILD_ID=      # 対象 Discord サーバー ID
DISCORD_PUB_KEY=       # Discord パブリックキー
DISCORD_SYNC_ROLE=     # 同期対象ロール
```

#### DynamoDB 設定
```env
DYNAMO_REGION=ap-northeast-1  # AWS リージョン
DYNAMO_TABLE_PREFIX=          # テーブル名プレフィックス
DYNAMO_SOFT_DELETE=true       # ソフトデリート有効化
```

#### Notion 統合
```env
NOTION_API_KEY=        # Notion API 統合トークン
NOTION_DATABASE_ID=    # 対象 Notion データベース ID
```

#### AWS サービス
```env
SQS_QUEUE_URL=         # メッセージ処理用 SQS キュー
```

### カスタム設定

#### `customSettings.ts`
Discord ロール ID を人間が読める名前にマッピング

**サポートロール例:**
- Admins
- Members
- CommunityManager
- Supporter

## 外部統合

### Discord Bot API
- **目的**: コミュニティメンバー管理とメッセージング
- **操作**: メンバー一覧、ロール管理、メッセージ送信、DM 送信
- **特徴**: レート制限、ページネーション、アバター処理、カスタムロールマッピング

### Notion API
- **目的**: ナレッジベースとメンバードキュメント管理
- **操作**: データベースクエリ、ページ作成・更新、メンバー同期
- **特徴**: リトライロジック、バッチ操作、アイコン管理、退出ステータス追跡

### AWS DynamoDB
- **目的**: プライマリメンバーデータストレージ
- **スキーマ**: パーティションキー（PartitionName）、ソートキー（DiscordId）
- **特徴**: ソフトデリート、バッチ操作、クエリ最適化、ページネーション

### AWS SQS
- **目的**: 非同期メッセージ処理
- **特徴**: イベント駆動アーキテクチャ、メッセージキューイング、Lambda 統合

### NFT 統合
- **外部 API**: `https://ehfm6q914a.execute-api.ap-northeast-1.amazonaws.com/getkey/`
- **目的**: NFT キー取得と Discord 通知
- **パラメータ**: uid, contract, id

## ビジネスロジック

### メンバー同期プロセス

1. **Discord メンバー取得**: ロールとアバター付きの全非ボットメンバーを取得
2. **データベース比較**: 新規、更新、削除メンバーを識別
3. **バッチ更新**: カウンター付きの追加・更新・削除処理
4. **通知**: 更新に対する Discord 通知送信
5. **エラーハンドリング**: リトライロジックと段階的な縮退

### データ整合性

- **信頼できる情報源**: Discord サーバーメンバーシップ
- **ソフトデリート**: 退出マークを付けて履歴データを維持
- **ロール同期**: Discord ID と名前間のカスタムロールマッピング
- **アイコン管理**: フォールバックオプション付き Discord アバター処理

### デプロイメントパイプライン

- **マルチ環境**: local、staging、production、flow 用の個別設定
- **自動デプロイ**: AWS Lambda への自動ビルド、ZIP化、デプロイ
- **バージョン管理**: デプロイ用のタイムスタンプベースバージョニング

## 運用

### ローカル開発
```bash
sh deploy/build.sh local
```

### デプロイメント
```bash
# ステージング環境
npm run stg

# 本番環境
npm run prd

# フロー環境
npm run flow
```

### ログとモニタリング

- AWS CloudWatch による Lambda ログ監視
- DynamoDB と Notion API のエラーログ
- Discord API レート制限監視
- SQS メッセージ処理状況

## セキュリティ

- 環境変数による機密情報管理
- Discord ボットトークンの安全な保管
- Notion API キーの適切な管理
- AWS IAM による最小権限アクセス

## 制限事項

- Discord API レート制限（1000リクエスト/10分）
- Notion API レート制限（3リクエスト/秒）
- Lambda 実行時間制限（15分）
- DynamoDB スループット制限

## トラブルシューティング

### よくある問題

1. **Discord API エラー**: ボットトークンとギルド ID の確認
2. **Notion 同期エラー**: API キーとデータベース ID の確認
3. **DynamoDB エラー**: AWS 認証情報とリージョン設定の確認
4. **Lambda タイムアウト**: 大量データ処理時のバッチサイズ調整

### デバッグ方法

1. `develop.ts` を使用した個別コンポーネントテスト
2. CloudWatch ログによる詳細エラー分析
3. 環境変数設定の確認
4. 外部 API 接続状況の確認

## 今後の拡張計画

- 他の Discord サーバーへの対応
- より詳細なメンバー統計レポート
- Slack など他のチャットプラットフォーム統合
- Web インターフェースによる管理画面
- リアルタイム同期機能の実装