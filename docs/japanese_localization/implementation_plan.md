# 実装計画: Printventory 日本語化およびビルド

## 1. 概要
3Dモデル管理デスクトップアプリケーション「Printventory」（Mithril-3d/Printventory フォーク）を日本語化し、Windowsインストーラー/実行可能バイナリとしてビルドします。
単なる静的書き換えではなく、多言語化（i18n）の仕組みを導入することで、デフォルトで日本語表示されつつ、必要に応じて英語表示との切り替えも可能な柔軟な設計にします。

## 2. アーキテクチャとアプローチ
- **i18nモジュール (`i18n.js`)**:
  - `localStorage` に選択中の言語（`ja` または `en`、初期値: `ja`）を保持。
  - `t(key, fallback)` 関数を提供し、辞書（`locales/ja.js`, `locales/en.js`）から翻訳テキストを取得。
  - HTML内の静的要素には `data-i18n="key"` 属性または `data-i18n-placeholder="key"`, `data-i18n-title="key"` 属性を付与し、DOM初期化時に一括適用。
  - 動的メッセージ（アラート、トースト、確認モーダル等）には `t(...)` を呼び出す。
- **UI統合**:
  - 設定メニューまたはヘッダー/フッターに言語切替トグル（日本語 / English）を設置。
- **パッケージング設定 (`package.json`)**:
  - `build.files` に `i18n.js` および `locales/**` を追加。
  - NSISインストーラー設定で日本語を優先設定。
- **ビルド**:
  - `npm install` 後、`npm run build:win` を実行して `dist/` 配下に Windows 用インストーラー（`Printventory-Setup-*.exe`）を生成。

## 3. 日本語化対象の主要コンポーネント
1. **ナビゲーション & サイドバー**:
   - ライブラリ（Library）、フォルダ（Folders）、タグ（Tags）、ステータス（Print Status）、デザイナー（Designers）
   - ディレクトリのスキャン（Scan Directory）、スライサー設定、サーバー設定など
2. **モデル一覧 & 詳細画面**:
   - モデル名、ファイルサイズ、頂点数、3Dプレビュー、メモ（Notes）、ライセンス、ソースURL
   - 印刷ステータス（未印刷、印刷キュー、印刷中、印刷完了、失敗等）
3. **管理機能**:
   - フィラメントマネージャー（Filament Manager）、プリンター管理（Printer Manager）、パーツ在庫（Parts Manager）
   - 重複検出（Duplicate Detection）、プリントルーレット（Print Roulette）、AIタグ付け
4. **設定 & システムモーダル**:
   - 一般設定、パフォーマンス、データベース修復・バックアップ/復元、ログ出力、アップデート確認

## 4. 検証手順
1. `npm install` による依存関係の正常インストール確認。
2. アプリの起動および言語切り替えの動作確認。
3. `npm run build:win` の実行と `dist/` 配下のインストーラー生成確認。
