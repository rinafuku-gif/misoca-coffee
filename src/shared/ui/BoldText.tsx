/**
 * CMSで編集可能な本文テキストの中で、特定の単語だけを太字にするための
 * 最小限のマークアップパーサー。`**太字**` という記法だけをサポートする
 * （フルのMarkdownパーサーは導入しない = 過剰実装を避ける）。
 *
 * 例: "**後藤伸啓**（兵庫県出身）と**稲福良祐**（大阪府出身）"
 *  → 後藤伸啓 と 稲福良祐 だけが <strong> で強調される。
 */
export function BoldText({
  text,
  boldClassName = "font-medium text-konsumi",
}: {
  text: string;
  boldClassName?: string;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        const match = /^\*\*([^*]+)\*\*$/.exec(part);
        if (match) {
          return (
            <span key={i} className={boldClassName}>
              {match[1]}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
