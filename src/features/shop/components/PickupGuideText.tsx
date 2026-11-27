import { pickupInstagramHref } from "../receiving-method";

const WORD = "Instagram";

/** 店頭受け取りの案内文。「Instagram」の語だけを、コーヒースタンドの Instagram への
 * リンクにする（新しいタブ・rel="noopener noreferrer"）。文そのものは変えないので、
 * 文の照らし合わせ（特商法・利用規約・コーヒースタンドのページ）はそのまま使える。 */
export function PickupGuideText({ text }: { text: string }) {
  const at = text.indexOf(WORD);
  if (at < 0) return <>{text}</>;
  return <>
    {text.slice(0, at)}
    <a href={pickupInstagramHref} target="_blank" rel="noopener noreferrer" aria-label={`${WORD}（新しいタブで開きます）`}
      className="text-karekusa underline decoration-usuzumi underline-offset-4 hover:decoration-karekusa focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karekusa">{WORD}</a>
    {text.slice(at + WORD.length)}
  </>;
}
