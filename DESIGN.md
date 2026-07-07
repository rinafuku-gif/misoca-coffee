# DESIGN.md — 三十日珈琲 Shared Roasting

> 静けさ、余白、古民家の時間、コーヒーと場所。  
> これらのブランドキーワードが、すべてのデザイン判断の起点になる。

---

## 1. Visual Theme & Atmosphere

**テーマ: 古民家の時間軸**

三十日珈琲のビジュアルは「築300年の古民家」という物理的な場所から発生する。
高速・鮮明・情報密度の高い現代的なWebとは逆方向へ進む。
ゆっくり現れる、大きく余白をとる、写真に語らせる。

| 要素 | 方針 |
|------|------|
| 空間 | セクション間のpadding-y は py-36〜py-52。息継ぎを設計する |
| 色温度 | 黄みがかった白 `#F7F6F1`（古い和紙）をベースに、くすんだアースカラーで統一 |
| 質感 | グラスモーフィズム・ネオン・シャープエッジは使わない。すべてのエッジはシャープか微丸（rounded-sm止まり）|
| 写真 | 人の手・豆・土壁・光が主役。テキストは写真の邪魔をしない |
| アニメーション | 「場所に到着する」感覚。急がない。easeは `[0.16, 1, 0.3, 1]` または `[0.25, 0.46, 0.45, 0.94]`|

---

## 2. Color Palette & Roles

### CSS変数（globals.css `@theme inline` より）

| 変数名 | 値 | 日本語名 | 用途 |
|--------|----|----------|------|
| `--color-karekusa` | `#5F5E4A` | 枯草色 | プライマリ。CTAボーダー、テキストリンク、アクセント |
| `--color-karekusa-dark` | `#4A4B3A` | 枯草・濃 | hover時のkarekusa濃色 |
| `--color-ainezu` | `#A0A1B5` | 藍鼠 | フッター内サブテキスト、アイコン |
| `--color-konsumi` | `#4A4B5F` | 紺鼠 | 見出し、フッター背景。日本的な藍がかったダーク |
| `--color-gold` | `#C8973E` | 金 | 最重要アクセント。CTAボタン、ラインアクセント、セクションラベル |
| `--color-gold-dark` | `#B5832F` | 金・濃 | gold のhover |
| `--color-kominka-white` | `#F7F6F1` | 古民家白 | body背景。黄みがかった和紙色 |
| `--color-tsuchikabe` | `#EDE8DF` | 土壁 | セクション背景のバリエーション |
| `--color-sumi` | `#2A2A2A` | 墨 | body文字色。真っ黒ではない |
| `--color-haicha` | `#7A7569` | 灰茶 | 本文サブテキスト、キャプション |
| `--color-usuzumi` | `#D5D1C9` | 薄墨 | ボーダー。`border-usuzumi/30` などで使う |
| `--color-error` | `#D9534F` | — | エラー表示のみ |
| `--color-success` | `#5CB85C` | — | 完了・成功表示のみ |

### カラーの使い方ルール

- **gold** は最も価値のある情報にだけ使う。乱用すると「古さ」になる
- **konsumi** は見出しとフッター背景に限定。本文には使わない
- **karekusa** はリンク・ボーダー・ホバー文字に使う（goldの次に目立つ）
- 白系は `kominka-white` を基本とし、純白 `#FFFFFF` は header blur 背景(`bg-white/90`)のみ
- 透明度は Tailwind の `/数値` で表現する（例: `bg-gold/40`, `text-white/70`）

---

## 3. Typography Rules

### 3.1 フォントファミリー

| 用途 | CSS変数 | フォールバックチェーン（完全版）|
|------|---------|-------------------------------|
| body・UI | `--font-sans` | `var(--font-noto-sans, "Noto Sans JP")`, `"Hiragino Sans"`, `"Hiragino Kaku Gothic ProN"`, `Meiryo`, `sans-serif` |
| 見出し・serif | `--font-serif` | `var(--font-noto-serif, "Noto Serif JP")`, `"Hiragino Mincho ProN"`, `"Yu Mincho"`, `serif` |
| ディスプレイ（欧文装飾） | `--font-display` | `var(--font-playfair, "Playfair Display")`, `serif` |

### 3.2 Noto Sans JP の読み込み設定

```
weight: ["400", "500", "700"]
variable: --font-noto-sans
display: swap
```

### 3.3 Noto Serif JP の読み込み設定

```
weight: ["400", "700"]
variable: --font-noto-serif
display: swap
```

### 3.4 Playfair Display の読み込み設定

```
weight: ["400"]
variable: --font-playfair
display: swap
```

Playfairはセクションラベル（`text-[11px] tracking-[0.5em] uppercase`）のみ使用。見出しのメインフォントはNoto Serif JP。

### 3.5 Tailwindでの呼び出し方

- `font-sans` → body・UI・ナビゲーション・フォーム
- `font-serif` → h1, h2, h3（globals.cssでデフォルト設定済み）
- `font-[family-name:var(--font-display)]` → Playfair DisplayはTailwindのユーティリティがないため直接CSS変数参照

### 3.6 本文タイポグラフィ

| プロパティ | 値 | 設定箇所 |
|-----------|-----|---------|
| `line-height`（body） | `1.8` | globals.css body |
| `line-height`（p） | `2` | globals.css p |
| `letter-spacing`（body） | `0.02em` | globals.css body |
| `letter-spacing`（本文テキスト） | `tracking-wide`（0.025em） | コンポーネント |
| `letter-spacing`（長文ボディ） | `leading-[2.2]` | コンポーネント |

### 3.7 見出しのサイズスケール

```
セクションラベル : text-[11px] tracking-[0.5em] uppercase（goldアクセント）
h2 ページ見出し : text-xl md:text-2xl font-serif font-light tracking-wider
h3 サブ見出し   : text-lg md:text-xl font-serif font-light tracking-wider
h1 ヒーロー     : text-2xl md:text-4xl lg:text-5xl font-serif font-light tracking-wider
ページHero副題  : text-xs md:text-sm tracking-[0.35em] uppercase（Playfair Display）
```

### 3.8 日本語組版の固有ルール

- **font-weight は控えめに**: 見出しは `font-light`（300）。力強さより「静けさ」
- **字間**: `tracking-wider`（0.05em）が見出しの基準。本文は `tracking-wide`（0.025em）
- **行間**: body 1.8、p 2.0、長文 2.2。行間を多めにとって余白を生む
- **禁則処理**: Tailwindのデフォルト。追加の禁則設定なし
- **テキスト選択**: `::selection` は `bg-gold` + `color: #fff`（globals.css）

---

## 4. Component Stylings

### ヘッダー

- 固定位置（`fixed top-[2px]`）。最上部に gold の 2px ラインアクセント（`z-[60]`）
- スクロール前: `bg-transparent`、テキスト `text-white/90`
- スクロール後: `bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(213,209,201,0.5)]`
- ロゴは2種類のPNG画像でスクロール状態を切り替え（white/dark）
- 高さ: `h-20`（80px）

### ナビゲーションリンク（デスクトップ）

- ホバー時: `scale-x-0 → scale-x-100` のunderline アニメーション（`origin-left`、`duration-300`）
- ドロップダウン: `bg-white rounded-sm border border-usuzumi/30`、Framer Motion `y: 8 → 0`

### CTAボタン（主）

```
bg-gold/90 hover:bg-gold text-white
px-7 py-2.5 text-sm font-medium tracking-wide
transition-all duration-300
角丸なし（border-radius: 0）
```

### CTAボタン（セカンダリ・アウトライン）

```
border border-karekusa/30 text-karekusa
hover:bg-karekusa hover:text-white
text-xs tracking-[0.15em] px-7 py-3.5
transition-all duration-500
角丸なし
```

### ヒーロー上のCTA（透過）

```
border border-white/40 text-white
hover:bg-white/15
text-xs tracking-[0.2em] px-8 py-4
transition-all duration-500
```

### カードコンポーネント

- 画像ホバー: `hover:scale-[1.03] transition-transform duration-[1.5s] ease-out`
- 角丸: 基本なし。ジャーナルカードのみ `rounded-sm`
- 画像オーバーレイ: `bg-black/0 group-hover:bg-black/10 transition-colors duration-500〜700`

### ドロップダウンメニュー

```
bg-white rounded-sm shadow-lg border border-usuzumi/30 py-2 min-w-[200px]
子リンク: px-5 py-2.5 text-sm text-sumi hover:text-karekusa hover:bg-tsuchikabe/50
```

### モバイルドロワー

- 右からスライドイン: `w-[85vw] max-w-[380px] bg-kominka-white`
- Spring アニメーション: `damping: 30, stiffness: 300`
- バックドロップ: `bg-black/40 backdrop-blur-sm`

### フッター

```
bg-konsumi text-white
最上部: グラデーション divider（from-transparent via-gold/40 to-transparent）
セクション見出し: text-xs tracking-[0.15em] uppercase text-white/50
リンク: text-ainezu hover:text-white transition-colors duration-300
下部区切り: ゴールドドット装飾（w-1 h-1 rounded-full）
```

### スクロールバー

```css
width: 6px
track: var(--color-kominka-white)
thumb: var(--color-karekusa)、border-radius: 3px
thumb:hover: var(--color-konsumi)
```

---

## 5. Layout Principles

### コンテナ

```
max-w-7xl mx-auto px-6 md:px-8  → 標準コンテナ（ヘッダー・メインコンテンツ）
max-w-6xl mx-auto px-6 md:px-8  → コンテンツセクション
max-w-4xl mx-auto px-6 md:px-8  → テキスト中心セクション・ヒーロー文章
max-w-2xl mx-auto               → 長文段落の最大幅
```

### グリッドシステム

- 2カラム交互レイアウト: `flex flex-col md:flex-row`、奇数番は `md:flex-row-reverse`
- 3カラムグリッド: `grid md:grid-cols-3 gap-10 md:gap-14`
- フッターグリッド: `grid-cols-1 md:grid-cols-2 lg:grid-cols-12`（ブランド3 + ナビ各2）

### セクション間余白

```
大セクション : py-36 md:py-52
中セクション : py-28 md:py-40
小セクション : py-24 md:py-32
ヒーロー内 : py-36 md:py-48
フッター   : py-20 md:py-24
```

### ヒーローレイアウト

- フルスクリーン: `h-screen min-h-[600px]`
- コンテンツは左寄せ `max-w-3xl`、画像はKen Burns（`scale-[1.0] → scale-[1.15]`、6秒）
- グラデーションオーバーレイ: `from-black/70 via-black/30 to-black/10`（縦）+ `from-black/20 to-transparent`（横）

### ギャラリー（横スクロール）

```
flex gap-4 md:gap-6 overflow-x-auto px-6 md:px-8 snap-x snap-mandatory
カード幅: w-[70vw] md:w-[35vw] lg:w-[28vw] snap-center
```

---

## 6. Depth & Elevation

三十日珈琲はシャドウを最小限にする。「影でなく余白で奥行きを出す」方針。

| レイヤー | 手法 |
|--------|------|
| ヘッダー（スクロール後） | `shadow-[0_1px_0_rgba(213,209,201,0.5)]` — 非常に繊細なライン |
| ドロップダウン | `shadow-lg border border-usuzumi/30` — ボーダーで存在感 |
| モーダル・ドロワー | `backdrop-blur-sm` バックドロップで視覚的階層を作る |
| 写真の奥行き | parallax（`useTransform`）と Ken Burns で動的奥行き |
| テキストの奥行き | 透明度の段差（`text-white/90` → `text-white/70` → `text-white/55`）|

**使ってはいけないもの**: 複数段のbox-shadow、drophshadow filter、ネオン系glow

---

## 7. Do's and Don'ts

### Do

- テキストは少なく。1セクション1メッセージに絞る
- 写真は大きく使う。aspect比を守る（`aspect-[4/3]`、`aspect-[3/2]`、`aspect-[4/5]`）
- アニメーションは `ScrollReveal` コンポーネント経由で統一する
- ホバー時の画像拡大は `scale-[1.03]`、`duration-[1.5s]`、`ease-out` を守る
- `border border-karekusa/30` でアウトラインボタンを作る。角丸なし
- セクションラベルは `text-[11px] tracking-[0.5em] uppercase text-gold/70`
- `rounded-sm` を超える角丸は使わない

### Don't

- `rounded-xl`、`rounded-2xl` 以上の角丸は使わない
- `shadow-xl` 以上の大きなシャドウは使わない
- グラデーション背景をコンテンツセクションに使わない（ヒーローオーバーレイのみ可）
- `font-bold`（700）を見出しに使わない。`font-light`（300）か `font-normal`（400）
- 純白 `#FFFFFF` をページ背景に使わない。必ず `kominka-white`（`#F7F6F1`）
- 情報密度を上げるためにpadding-yを削らない
- Playfair Displayを見出しの主役にしない。あくまでラベル装飾
- アニメーションに `ease-linear` や `ease-in` を使わない。必ず柔らかいカーブ

---

## 8. Responsive Behavior

### ブレークポイント（Tailwind デフォルト）

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### モバイル（〜767px）

- ナビゲーション: 全非表示 → 右スライドドロワー（`lg:hidden`）
- 2カラムレイアウト: `flex-col`（縦積み）
- フォントサイズ: `text-2xl`（h1ヒーロー）、`text-xl`（h2）、`text-lg`（h3）
- セクション余白: `py-36`（デスクトップ `py-52` より小さい）
- ギャラリー: 横スクロール `w-[70vw]` + `snap-x snap-mandatory`
- ドロワー幅: `w-[85vw] max-w-[380px]`

### タブレット（768px〜1023px）

- ナビゲーション: 引き続きドロワー（`lg:hidden`）
- 2カラム: `md:flex-row` で横並び
- フッター: `md:grid-cols-2`

### デスクトップ（1024px〜）

- ナビゲーション: フルヘッダーナビ表示（`hidden lg:flex`）
- ヒーロー文章: `lg:text-5xl`
- フッター: `lg:grid-cols-12`

### タッチへの配慮

- タップターゲット最小 `44px`（ハンバーガー `w-10 h-10`、モバイルナビリンク `py-3`）
- `scroll-behavior: smooth`（globals.css）
- スクロールイベント: `passive: true` で登録

---

## 9. Agent Prompt Guide

このセクションは、AIエージェントが三十日珈琲のUIを実装・修正するときの参照用。

### 新しいセクションを作るとき

```tsx
// セクションの骨格
<section className="py-36 md:py-52">
  <div className="max-w-6xl mx-auto px-6 md:px-8">
    <ScrollReveal>
      <div className="text-center mb-28 md:mb-36">
        <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
          Section Label
        </p>
        <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
          日本語の見出し
        </h2>
      </div>
    </ScrollReveal>
    {/* コンテンツ */}
  </div>
</section>
```

### 新しいボタンを作るとき

```tsx
// プライマリ（gold塗り）— CTAヘッダー
<button className="px-7 py-2.5 text-sm font-medium tracking-wide bg-gold/90 hover:bg-gold text-white transition-all duration-300">
  アクション
</button>

// セカンダリ（アウトライン）— 一般CTA
<button className="inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500">
  アクション
  <ArrowIcon />
</button>

// ヒーロー上（半透過）
<button className="inline-flex items-center gap-3 border border-white/40 text-white text-xs tracking-[0.2em] px-8 py-4 hover:bg-white/15 transition-all duration-500">
  アクション
</button>
```

### 画像コンポーネントを作るとき

```tsx
// 標準の画像ホバー
<div className="relative aspect-[4/3] overflow-hidden">
  <Image
    src={src}
    alt={alt}
    fill
    className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
  />
</div>
```

### アニメーションを追加するとき

```tsx
// スクロールトリガー（ScrollReveal コンポーネントを使う）
<ScrollReveal direction="up" delay={0.2}>
  {/* コンテンツ */}
</ScrollReveal>

// ページ読み込み時のフェードイン
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
>
  {/* コンテンツ */}
</motion.div>
```

### よく使うカラートークン（Tailwindクラス）

```
背景   : bg-kominka-white / bg-tsuchikabe / bg-konsumi
テキスト: text-sumi / text-haicha / text-konsumi / text-karekusa / text-gold
ボーダー: border-usuzumi/30 / border-karekusa/30 / border-white/40
アクセント: bg-gold / text-gold/70（ラベル）/ bg-gold/40（ライン）
```

### フォント指定

```
通常テキスト : クラス指定なし（font-sansがbodyデフォルト）
見出し       : font-serif（h1,h2,h3はglobals.cssで自動適用）
Playfair使用 : font-[family-name:var(--font-display)]
```

### アニメーション easing のリファレンス

```
標準（ゆっくり落ち着く）: ease: [0.16, 1, 0.3, 1]
中速（自然な動き）      : ease: [0.25, 0.46, 0.45, 0.94]
使わない                : ease-linear, ease-in, bounce
```

---

## 10. Design Harness — Verification Checklist

AIエージェントがUIを実装・修正した後、Ryoに見せる前に以下を全て確認する。**省略禁止。**

### 10.1 トークン準拠チェック

- [ ] カラーはすべてCSS変数（`text-sumi` / `bg-gold` / `border-usuzumi` 等）で指定しているか
- [ ] ハードコードカラー（`#xxx` / `rgb()` / `color-[#xxx]`）を使っていないか
- [ ] 角丸は `rounded-sm` 止まりか（`rounded-xl` 以上は禁止）
- [ ] シャドウは `shadow-lg` 以内か（`shadow-xl` 以上は禁止）
- [ ] セクション余白は規定値（`py-36`/`py-28`/`py-24`）を使っているか

### 10.2 コンポーネントチェック

- [ ] 既存コンポーネント（CTAボタン・カード・ScrollReveal・ドロップダウン等）を再実装していないか
- [ ] 新しいボタンを作る前に「CTAボタン（主）・（セカンダリ）・（ヒーロー上）」で代用できないか確認したか
- [ ] アニメーションは `ScrollReveal` コンポーネント経由で統一されているか

### 10.3 状態の抜けチェック

- [ ] データなし時の **empty state** を設計しているか（リスト・カード系）
- [ ] API通信中の **loading state** を設計しているか
- [ ] 通信失敗時の **error state** を設計しているか
- [ ] フォームのバリデーション状態を設計しているか

### 10.4 レスポンシブ・モバイルチェック

- [ ] モバイル（〜767px）でヘッダーナビが消えてドロワーに切り替わるか
- [ ] タップターゲットが最小44pxあるか（ボタン・リンク・ハンバーガー）
- [ ] 横スクロールが発生していないか
- [ ] 文字が `overflow-hidden` でクリッピングされていないか
- [ ] フォントサイズがモバイルで適切か（h1: `text-2xl`、h2: `text-xl`、h3: `text-lg`）

### 10.5 アクセシビリティチェック

- [ ] `<Image>` に `alt` 属性があるか（装飾目的なら `alt=""`）
- [ ] インタラクティブ要素に `aria-label` があるか（アイコンボタン等）
- [ ] 金色（gold `#C8973E`）を白背景に使う場合、コントラスト比を確認したか（注: gold on white = 約3:1、**AA不適合**。代替を検討）
- [ ] `konsumi`（`#4A4B5F`）が本文テキストに使われていないか（見出し・フッター限定）

### 10.6 ビジュアル整合チェック

- [ ] 既存ページと比べて情報密度・フォントサイズ・余白が揃っているか
- [ ] 写真のアスペクト比は守られているか（`aspect-[4/3]`・`aspect-[3/2]`・`aspect-[4/5]`）
- [ ] 純白 `#FFFFFF` をページ背景に使っていないか（必ず `kominka-white`）
- [ ] `font-bold` を見出しに使っていないか（`font-light` か `font-normal` が正解）

---

## 11. Lessons Learned（LLM Wikiフィードバックループ）

> AIが実装・修正のたびに外したパターンをここに記録する。
> 同じミスが2回出たら「Section 7 Don't」に昇格させる。

このセクションはレビューのたびに育てる。最初から完璧にする必要はない。

### 記録フォーマット

```
### YYYY-MM-DD — [ミスの概要]
**何が起きた**: （AIが何を生成したか）
**何が問題か**: （DESIGN.mdのどのルールに違反していたか）
**正しいパターン**: （今後どうすべきか）
```

### 記録欄（順次追記）

_（初期は空。AIが間違えるたびに追記する）_
