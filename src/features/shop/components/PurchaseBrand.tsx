import Image from "next/image";
import { PageHero } from "@/shared/ui/PageHero";
import { purchaseUi } from "./purchase-ui";
export { purchaseUi } from "./purchase-ui";

/** Navigation only: choosing quantities is not an order or a quoted total. */
export function PurchaseSelectionSummary({ count }: { count: number }) {
  return <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-usuzumi py-4">
    <p role="status" aria-live="polite" className="text-sm text-sumi">{count > 0 ? <>選んだ商品 <span className="ml-2 font-serif text-xl text-konsumi">{count}点</span></> : "気になる商品の数量をお選びください"}</p>
    {count > 0 ? <a href="#purchase-summary" className={purchaseUi.link}>選んだ内容・送料を確認 <span aria-hidden="true" className="ml-3">↓</span></a> : <span className="text-xs text-haicha">選ぶだけでは注文されません</span>}
  </div>;
}

/** The two links back to the shop are plain anchors on purpose. They render
 * only on the purchase and order-status pages, which are not measured; leaving
 * those pages must be a full page load so that a measured page and an
 * unmeasured page never share one loaded document (see SiteMeasurement). */
export function PurchaseBrandHeader({ title, description, shopIntroduction = false, shopRoot = false }: { title: string; description: string; shopIntroduction?: boolean; shopRoot?: boolean }) {
  return <header className="pb-10 sm:pb-12">
    {!shopRoot ? <div className="mb-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-usuzumi pb-6 sm:mb-8">
      <a href="/shop" aria-label="三十日珈琲のショップへ" className="inline-flex min-h-12 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karekusa">
        <Image src="/images/logo-circle-green.jpg" alt="" width={40} height={40} className="h-10 w-10" />
        <Image src="/images/logo-text-dark.png" alt="三十日珈琲 Shared Roasting" width={130} height={48} className="h-10 w-auto" />
      </a>
      <a href="/shop" className={purchaseUi.link}>ショップの案内へ戻る</a>
    </div> : null}
    {shopIntroduction ? <>
      <PageHero title="ONLINE SHOP" subtitle={title} image="/images/experience/coffee-beans-close.jpg" compact />
      <p className="mt-3 text-xs leading-relaxed text-haicha">ショップ共通のイメージ写真です。各商品の実物写真ではありません。</p>
      <p className="mx-auto mt-10 max-w-2xl text-[15px] leading-loose tracking-wide text-karekusa sm:mt-14 sm:text-center sm:text-base">{description}</p>
    </> : <div>
    <div>
    <div aria-hidden="true" className="mb-6 h-px w-10 bg-gold" />
    <h1 className="font-serif text-[28px] font-normal leading-relaxed tracking-wider text-konsumi sm:text-[40px]">{title}</h1>
    <p className="mt-5 max-w-xl text-[15px] leading-loose tracking-wide text-karekusa sm:text-base">{description}</p>
    </div>
    </div>}
  </header>;
}
