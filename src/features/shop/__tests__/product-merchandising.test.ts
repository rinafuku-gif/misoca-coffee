import { expect, it, vi } from "vitest";
import { productMerchandising, roastChoice } from "../product-merchandising";
import type { BeanDisplay } from "../bean-display";

const coffeeSku = "bn_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa_300";
vi.mock("@content/pages/shop-merchandising.json", () => ({
  default: {
    items: [
      { key: "yuzu-drip-bag", badge: "new" },
      { key: "bn_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa_300", badge: "recommended", note: " 店主の一言 " },
      { key: "bn_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb_300", badge: "invalid" },
    ],
  },
}));

const display: BeanDisplay = {
  id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  name: "検証用の豆",
  origin: "",
  roast: "中煎り",
  flavor: "  登録済みの香り  ",
  process: "",
  variety: "",
  region: "",
  farm: "",
  altitude: "",
  description: "",
  image: "",
};

it("設定した商品だけにバッジを付け、味わいは運営の一言または登録済みの風味を表示する", () => {
  expect(productMerchandising({ skuId: coffeeSku, name: display.name, display }))
    .toEqual({ badge: "おすすめ", note: "店主の一言" });
  expect(productMerchandising({ skuId: "gd_yuzu", name: "ドリップバッグ（ゆずインフューズド）", display: null }))
    .toEqual({ badge: "NEW", note: undefined });
  expect(productMerchandising({ skuId: "bn_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb_300", name: display.name, display }))
    .toEqual({ badge: undefined, note: "登録済みの香り" });
  expect(productMerchandising({ skuId: "bn_cccccccccccccccccccccccccccccccc_300", name: "別の商品", display: null }))
    .toEqual({ badge: undefined, note: undefined });
});

it("区分が曖昧または未入力の焙煎度はその他として選べる", () => {
  expect(roastChoice(" 中浅煎り ")).toBe("light");
  expect(roastChoice("中煎り")).toBe("medium");
  expect(roastChoice("中深煎り")).toBe("dark");
  expect(roastChoice("中煎り・深煎り")).toBe("unlisted");
  expect(roastChoice(undefined)).toBe("unlisted");
});
