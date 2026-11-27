import { cancelFlowCopy } from "../order-cancel";

/** キャンセルを申し込んだ後（受付後・申し込み済み）の「まだ確定していない」と「このあとの流れ」。
 * メールのリンクのページと注文状況のページで同じ文を使う。日数の約束は書かない。 */
export function CancelFlowSteps() {
  return <div className="text-sm leading-relaxed text-sumi">
    <p className="font-medium">{cancelFlowCopy.notYet}</p>
    <p className="mt-4 font-medium text-konsumi">{cancelFlowCopy.stepsHeading}</p>
    <ol className="mt-2 list-decimal space-y-2 pl-5">
      {cancelFlowCopy.steps.map(step => <li key={step}>{step}</li>)}
    </ol>
  </div>;
}
