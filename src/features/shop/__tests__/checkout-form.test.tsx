import { readFileSync, readdirSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CHECKOUT_FORM_STORAGE_KEY, UENOHARA_POSTAL_CODES, checkoutFormWire, checkoutFormWireSchema, normalizePhone, emptyCheckoutForm, localDeliveryAllowed, normalizePostalCode, readCheckoutFormDraft, validateCheckoutForm, writeCheckoutFormDraft, type CheckoutFormDraft } from "../checkout-form";
import { lookupPostalAddress } from "../postal-address";
import { CheckoutFormFields, formCopy } from "../components/CheckoutForm";
import { checkoutRequestBody } from "../receiving-method";
import { purchaseAttemptSchema } from "../purchase-session";
import config from "../../../../next.config";

const filled: CheckoutFormDraft = { ...emptyCheckoutForm, buyerName: "架空 花子", buyerEmail: "buyer@example.invalid", buyerPhone: "090-1234-5678",
  postalCode: "409-0113", prefecture: "山梨県", city: "上野原市", line1: "新田1-2", line2: "" };
const noop = () => {};
afterEach(() => vi.unstubAllGlobals());

describe("入力の確かめ（画面側。サーバーでも確かめる）", () => {
  it("配送: 購入者3項目と住所が必要。建物名・備考は任意", () => {
    const errors = validateCheckoutForm(emptyCheckoutForm, "shipping");
    expect(Object.keys(errors).sort()).toEqual(["buyerEmail", "buyerName", "buyerPhone", "city", "line1", "postalCode", "prefecture"].sort());
    expect(validateCheckoutForm(filled, "shipping")).toEqual({});
  });
  it("店頭受け取り: 購入者の入力だけ", () => {
    expect(validateCheckoutForm({ ...emptyCheckoutForm, buyerName: "架空", buyerEmail: "a@b.jp", buyerPhone: "0554000000" }, "store_pickup")).toEqual({});
  });
  it("お届け先がご購入者と違うときは、お届け先のお名前と電話番号も必要", () => {
    expect(Object.keys(validateCheckoutForm({ ...filled, sameAsBuyer: false }, "shipping")).sort()).toEqual(["recipientName", "recipientPhone"]);
  });
  it("形と長さ（CHECKOUT-FORM-WIRE.md の決まり）: 名前40・市区町村40・番地60・建物60・備考300・電話13", () => {
    const errors = validateCheckoutForm({ ...filled, buyerName: "あ".repeat(41), buyerEmail: "a@b", buyerPhone: "12345", postalCode: "40901", prefecture: "山梨", city: "あ".repeat(41), line1: "あ".repeat(61), line2: "あ".repeat(61), remarks: "あ".repeat(301) }, "shipping");
    expect(errors).toEqual({ buyerName: "40文字以内で入力してください", buyerEmail: "メールアドレスの形を確かめてください", buyerPhone: "電話番号を数字で入れてください（10〜11桁）", postalCode: "郵便番号は7桁の数字です", prefecture: "都道府県を選んでください", city: "40文字以内で入力してください", line1: "60文字以内で入力してください", line2: "60文字以内で入力してください", remarks: "300文字以内で入力してください" });
    expect(validateCheckoutForm({ ...filled, buyerPhone: "＋８１ ９０－１２３４－５６７８", postalCode: "４０９－０１１３" }, "shipping")).toEqual({});
  });
  it("電話: 半角数字とハイフン・0で始まる10か11桁・13文字まで・ハイフンの端や連続は不可", () => {
    expect(normalizePhone("（0554）12－3456")).toBe("055412-3456");
    for (const ok of ["0554-12-3456", "09012345678", "090-1234-5678"]) expect(validateCheckoutForm({ ...filled, buyerPhone: ok }, "shipping")).toEqual({});
    for (const bad of ["-0554-12-3456", "0554--12-3456", "0554-12-3456-", "1554123456", "055412345", "0901-2345-67890", "05-54-12-34-56"]) expect(validateCheckoutForm({ ...filled, buyerPhone: bad }, "shipping").buyerPhone, bad).toBeDefined();
  });
  it("メール: 半角の表示できる文字だけ。< > ( ) , ; : [ ] \" \\ を含めない", () => {
    expect(validateCheckoutForm({ ...filled, buyerEmail: "ｂｕｙｅｒ＠ｅｘａｍｐｌｅ．ｊｐ" }, "shipping")).toEqual({});
    for (const bad of ["a(b)@example.jp", "a;b@example.jp", "山田@example.jp", "a@example"]) expect(validateCheckoutForm({ ...filled, buyerEmail: bad }, "shipping").buyerEmail, bad).toBeDefined();
  });
  it("上野原市内お届け: 市内の郵便番号（22件）だけ。入力途中は判定しない", () => {
    expect(validateCheckoutForm(filled, "local_delivery")).toEqual({});
    expect(validateCheckoutForm({ ...filled, postalCode: "1000001" }, "local_delivery").postalCode).toBe("上野原市内のご住所のみお届けできます");
    expect([localDeliveryAllowed("4010201"), localDeliveryAllowed("100-0001"), localDeliveryAllowed("4090")]).toEqual([true, false, null]);
  });
  it("22件は、置いた日本郵便のデータで市区町村が上野原市の郵便番号と同じ", () => {
    const codes: string[] = [];
    for (const file of readdirSync("public/postal-addresses")) {
      const shard = JSON.parse(readFileSync(`public/postal-addresses/${file}`, "utf8")) as Record<string, [string, string, string]>;
      for (const [rest, [, city]] of Object.entries(shard)) if (city === "上野原市") codes.push(file.slice(0, 2) + rest);
    }
    expect(codes.sort()).toEqual([...UENOHARA_POSTAL_CODES].sort());
    expect(UENOHARA_POSTAL_CODES.size).toBe(22);
  });
});

describe("サーバーへ渡す form（CHECKOUT-FORM-WIRE.md §1–2 のとおり）", () => {
  it("ご購入者と同じ: delivery は sameAsBuyer:true と住所だけ（名前・電話・sender は付けない）。前後の空白・制御文字なし", () => {
    const wire = checkoutFormWire({ ...filled, buyerName: " 架空 花子 ", buyerEmail: " buyer@example.invalid ", newsletter: true, remarks: " 午前中\r\n希望\t " }, "shipping");
    expect(wire).toEqual({ buyer: { name: "架空 花子", email: "buyer@example.invalid", phone: "090-1234-5678" },
      delivery: { sameAsBuyer: true, postalCode: "4090113", prefecture: "山梨県", city: "上野原市", line1: "新田1-2", line2: "" },
      remarks: "午前中\n希望", newsletter: true });
    expect(JSON.stringify(Object.keys(wire))).toBe('["buyer","delivery","remarks","newsletter"]');
  });
  it("別の人へ: delivery に名前・電話、sender は必須（buyer／shop）", () => {
    const gift = checkoutFormWire({ ...filled, sameAsBuyer: false, recipientName: "架空 太郎", recipientPhone: "03-0000-0000", sender: "shop" }, "shipping");
    expect(gift.delivery).toEqual({ sameAsBuyer: false, name: "架空 太郎", phone: "03-0000-0000", postalCode: "4090113", prefecture: "山梨県", city: "上野原市", line1: "新田1-2", line2: "" });
    expect(gift.sender).toBe("shop");
  });
  it("店頭受け取り: delivery は null、sender なし", () => {
    const pickup = checkoutFormWire(filled, "store_pickup");
    expect(pickup.delivery).toBeNull(); expect(pickup).not.toHaveProperty("sender");
  });
  it("決まりに外れた形は送らない（知らない項目・sender の付け方・長さ）", () => {
    const good = checkoutFormWire(filled, "shipping");
    for (const bad of [{ ...good, extra: 1 }, { ...good, sender: "buyer" }, { ...good, buyer: { ...good.buyer, name: "あ".repeat(41) } }, { ...good, remarks: " x" }, { ...good, delivery: { ...good.delivery, name: "x" } }])
      expect(checkoutFormWireSchema.safeParse(bad).success).toBe(false);
    expect(() => checkoutFormWire({ ...filled, buyerEmail: "x" }, "shipping")).toThrow();
  });
  it("決済の依頼: 今の本文に form を1つ足す（キーの順も見本どおり）。決済の記録が同じ form を持ち、お支払いに戻るも同じ本文", () => {
    const form = checkoutFormWire(filled, "local_delivery");
    const attempt = purchaseAttemptSchema.parse({ purchaseKey: "a".repeat(64), lines: [{ skuId: "beans", quantity: 1 }], acceptedQuote: "b".repeat(64), deliveryMethod: "local_delivery", form });
    expect(Object.keys(checkoutRequestBody(attempt))).toEqual(["purchaseKey", "lines", "acceptedQuote", "deliveryMethod", "form"]);
    expect(JSON.stringify(checkoutRequestBody(attempt)).length).toBeLessThan(8192);
    // An older attempt without a form still sends today's body.
    expect(JSON.stringify(checkoutRequestBody({ purchaseKey: "a".repeat(64), lines: [{ skuId: "beans", quantity: 1 }], acceptedQuote: "b".repeat(64) }))).toBe(`{"purchaseKey":"${"a".repeat(64)}","lines":[{"skuId":"beans","quantity":1}],"acceptedQuote":"${"b".repeat(64)}"}`);
  });
  it("最大の入力でも本文は 8,192 バイトの中に収まる", () => {
    const big = { ...filled, buyerName: "あ".repeat(40), sameAsBuyer: false, recipientName: "あ".repeat(40), recipientPhone: "090-1234-5678", city: "あ".repeat(40), line1: "あ".repeat(60), line2: "あ".repeat(60), remarks: "あ".repeat(300), buyerEmail: `${"a".repeat(240)}@example.jp` };
    const lines = Array.from({ length: 20 }, (_, i) => ({ skuId: `bn_${String(i).padStart(32, "0")}_300`, quantity: 20 }));
    const body = checkoutRequestBody({ purchaseKey: "a".repeat(64), lines, acceptedQuote: "b".repeat(64), deliveryMethod: "local_delivery", form: checkoutFormWire(big, "shipping") });
    expect(new TextEncoder().encode(JSON.stringify(body)).length).toBeLessThan(8192);
  });
  it("入力の下書きはこのタブだけに残し、壊れた値は空に戻す", () => {
    const map = new Map<string, string>(); const storage = { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); } };
    writeCheckoutFormDraft(storage, filled); expect(readCheckoutFormDraft(storage)).toEqual(filled);
    map.set(CHECKOUT_FORM_STORAGE_KEY, '{"buyerName":1}'); expect(readCheckoutFormDraft(storage)).toEqual(emptyCheckoutForm);
  });
});

describe("郵便番号から住所（外部のサービスを使わない）", () => {
  it("このサイトの /postal-addresses/<上2桁>.json だけを、Cookie・参照元なしで読む", async () => {
    const fetchMock = vi.fn(async () => Response.json({ "90113": ["山梨県", "上野原市", "新田"] })); vi.stubGlobal("fetch", fetchMock);
    expect(await lookupPostalAddress("４０９-０１１３")).toEqual({ prefecture: "山梨県", city: "上野原市", town: "新田" });
    expect(fetchMock).toHaveBeenCalledWith("/postal-addresses/40.json", expect.objectContaining({ credentials: "omit", referrerPolicy: "no-referrer" }));
    expect(await lookupPostalAddress("409-0199")).toBeNull();
    expect(await lookupPostalAddress("4090")).toBeNull(); expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(normalizePostalCode(" 409ー0113 ")).toBe("4090113");
  });
  it("データは日本郵便の公開データ由来の100ファイル。長く使い回してよい（30日）", () => {
    expect(readdirSync("public/postal-addresses")).toHaveLength(100);
    expect(JSON.parse(readFileSync("public/postal-addresses/40.json", "utf8"))["90113"]).toEqual(["山梨県", "上野原市", "新田"]);
    return Promise.resolve(config.headers!()).then(rules => {
      const rule = rules.find(r => r.source === "/postal-addresses/:path*");
      expect(rule?.headers).toContainEqual({ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=2592000" });
    });
  });
});

describe("入力欄の見た目と操作", () => {
  const render = (form: CheckoutFormDraft, method: "shipping" | "local_delivery" | "store_pickup", errors = {}) =>
    renderToStaticMarkup(<CheckoutFormFields form={form} method={method} errors={errors} disabled={false} onChange={noop} onBlur={noop} />);
  it("配送: 購入者・お届け先（ご購入者と同じ＝既定でオン）・備考・メルマガ（既定でオフ）", () => {
    const html = render(emptyCheckoutForm, "shipping");
    for (const text of [formCopy.buyer, formCopy.recipient, formCopy.same, formCopy.postalCode, formCopy.remarksHint, formCopy.newsletter]) expect(html).toContain(text);
    expect(formCopy.remarksHint).toBe("お届け希望日時などがあればご記入ください（ご希望に添えない場合があります）");
    expect(formCopy.newsletter).toBe("三十日珈琲からのお知らせをメールで受け取る");
    const checkboxes = [...html.matchAll(/<input type="checkbox"[^>]*>/g)].map(m => m[0]);
    expect(checkboxes).toHaveLength(2); expect(checkboxes[0]).toContain("checked"); expect(checkboxes[1]).not.toContain("checked");
    expect(html).not.toContain(formCopy.sender);
    for (const ac of ["name", "email", "tel", "shipping postal-code", "shipping address-level1", "shipping address-line1"]) expect(html.toLowerCase()).toContain(`autocomplete="${ac}"`);
  });
  it("ご購入者と違うとき: お届け先のお名前・電話と、送り主の表示（ご購入者のお名前／三十日珈琲）", () => {
    const html = render({ ...emptyCheckoutForm, sameAsBuyer: false }, "shipping");
    expect(html).toContain('id="checkout-recipientName"'); expect(html).toContain(formCopy.sender);
    expect(html).toContain(">ご購入者のお名前</label>"); expect(html).toContain(">三十日珈琲</label>");
  });
  it("店頭受け取り: 購入者の入力だけ（住所・送り主なし）", () => {
    const html = render(emptyCheckoutForm, "store_pickup");
    expect(html).not.toContain(formCopy.recipient); expect(html).not.toContain('id="checkout-postalCode"');
  });
  it("エラーは欄のすぐ下に1行。欄とつながる", () => {
    const html = render(emptyCheckoutForm, "shipping", { buyerEmail: "メールアドレスの形を確かめてください" });
    expect(html).toMatch(/id="checkout-buyerEmail"[^>]*aria-invalid="true"[^>]*aria-describedby="checkout-buyerEmail-error"|aria-invalid="true" aria-describedby="checkout-buyerEmail-error"/);
    expect(html).toContain('<p id="checkout-buyerEmail-error"');
  });
  it("上野原市内お届けで市外の郵便番号は、押す前からすぐ知らせる", () => {
    expect(render({ ...filled, postalCode: "1000001" }, "local_delivery")).toContain("上野原市内のご住所のみお届けできます");
    expect(render(filled, "local_delivery")).not.toContain("上野原市内のご住所のみお届けできます");
  });
  it("押せる場所は44px以上、文字は16px（iPhoneで拡大されない）", () => {
    const html = render({ ...emptyCheckoutForm, sameAsBuyer: false }, "shipping");
    for (const tag of html.match(/<input [^>]*type="(?:text|email|tel)"[^>]*>/g) ?? []) { expect(tag).toContain("min-h-12"); expect(tag).toContain("text-base"); }
    expect(html.match(/<label[^>]*class="flex min-h-12/g)?.length).toBeGreaterThanOrEqual(4);
  });
});
