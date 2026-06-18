# AIフレンドリー設計 — 現状診断と移行提案

作成: 2026-06-18 / 対象: 三十日珈琲サイト（Next.js + Notion SDK）
※ このレポートは「提案」です。実装はしていません。Ryoの承認後に着手します。

---

## 1. 今のコードの良いところ

すでにAIが扱いやすい土台が整っている。

- **TypeScript + tsc/build/test の検証ループ**が揃っている（`npm run build` / `npx tsc --noEmit` / `npm test`）
- 料金・予約定数が `src/lib/pricing.ts` `src/lib/group-reservation-constants.ts` に分離され、テスト（`src/lib/__tests__/`）もある
- ファイルは概ね小さく1責務に分かれている

## 2. 弱点（AIが間違えやすいポイント）

### 弱点A: ページ中心構造で「機能の縦割り」になっていない
今は `src/app/<ページ>/` にページ、`src/components/` に部品、`src/lib/` にロジックがフォルダ別に分散している。
1つの機能（例: 予約）を直すとき、AIは3〜4フォルダを行き来する必要があり、関連を掴むのにトークンを浪費する＝精度が落ちる。

### 弱点B: ★Notionのデータに「型の真実の源」がない（最重要）
`src/lib/notion.ts` では、Notionから返ってくるデータを
`page as Record<string, unknown>` のように**素のキャストで無理やり型を当てている**。

問題点:
- Notion側でDBのプロパティ名（例:「ステータス」「公開日」）を1文字でも変えると、**コードはエラーを出さずに静かに空文字や undefined を返す**（型チェックをすり抜ける）
- 手書きの `interface`（JournalPost / Product 等）が実データと一致している保証がない
- AIがこのファイルを読んでも「実際にどんな形のデータが来るか」を型から読み取れない

---

## 3. 提案

### 提案(a): ページ中心 → 縦割りへの段階移行

**今あるものは壊さない。新規機能から縦割りで始め、既存は触るついでに寄せる**のが安全。

移行イメージ（例: 予約機能）:
```
src/features/reservation/   ← 機能を1ディレクトリに同居
  components/   （今の src/components/reservation/ を移動）
  api/          （予約APIのロジック）
  schema.ts     （型・検証スキーマ＝真実の源）
  index.ts      （外から使う入口をまとめる）
```

手順（リスク低い順）:
1. **新規機能のみ縦割りで作る**（既存は当面そのまま）。まず1機能で試す
2. 既存機能は「次に触るとき」に少しずつ `features/` へ寄せる（一括移動はしない＝デグレ防止）
3. import パスが変わるので、1機能ずつ `tsc`/`build`/`test` を通して確認しながら進める

→ これは**Ryoの承認が必要**（フォルダ構成の変更＝影響範囲が広いため）。急ぎではない。

### 提案(b): ★Notionレスポンスを zod スキーマで包む（最優先・効果大）

`zod`（＝データの形を検証するライブラリ）を1つ入れ、Notionのレスポンスを**検証してから使う**ようにする。
型はスキーマから自動で導く（手書きの interface を廃止）＝**スキーマが唯一の真実の源**になる。

イメージ（`src/lib/notion.ts` のリファクタ方向）:
```ts
import { z } from "zod";

// 1) スキーマを定義（これが「真実の源」）
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  inStock: z.boolean(),
  // ... 以下、今の Product interface と同じ項目
});

// 2) 型はスキーマから導く（手書き interface を廃止＝二重定義を消す）
export type Product = z.infer<typeof ProductSchema>;

// 3) Notionから組み立てたオブジェクトを検証してから返す
const parsed = ProductSchema.safeParse(rawProduct);
if (!parsed.success) {
  // 形が変わったらここで気づける（静かな undefined 事故を防ぐ）
  console.error("Notion product shape mismatch", parsed.error);
  return null; // or スキップ
}
return parsed.data;
```

得られる効果:
- **Notion側のプロパティ名変更を、本番で壊れる前に検知できる**（今は静かに失敗する）
- 手書き型と実データのズレが消える（`z.infer` で型を1本化）
- AIが `schema.ts` を読むだけで「来るデータの形」を正確に掴める＝幻覚が減る

注意点:
- `zod` の追加（依存1つ）。バンドルへの影響は小さい
- 既存の `getTitle` / `getSelect` 等のヘルパは活かしたまま、**最後に検証を1枚かぶせる**のが最小コストの寄せ方
- まず影響が小さい `getProducts` / `getJournalPosts`（表示系・読み取り）から始め、`saveReservation`（書き込み系）は慎重に

→ これも**Ryoの承認が必要**（依存追加＋ `notion.ts` の書き換え）。ただし提案(a)より小さく、効果は最も大きい。**おすすめは(b)を先に着手**。

---

## 4. 今回このブランチでやったこと（実装済み）

- `CLAUDE.md` に「AIフレンドリー設計（コード実装の規約）」セクションを追記（既存は保持）
- `.gitignore` に `.claude/worktrees/`（並行作業用ディレクトリ）を追加
- このレポートを追加

いずれもドキュメント追加のみ。**動くコード（サイトの挙動）は一切変えていない**。
