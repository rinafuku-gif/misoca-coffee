---
paths:
  - "src/lib/**/*.ts"
  - "src/app/api/**/*.ts"
---

# Notion API連携ルール

- Notion APIのレスポンスは型安全に扱う
- APIキーはコードに直接書かない。環境変数を使用する
- Notion DBのプロパティ名を変更する場合は事前確認を取る
