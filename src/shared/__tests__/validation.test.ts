import { describe, it, expect } from "vitest";
import { sanitizeString, isValidEmail } from "../validation";

// ─── sanitizeString ───────────────────────────────────────────────────────────

describe("sanitizeString", () => {
  it("HTMLタグを除去する", () => {
    expect(sanitizeString("<b>太字</b>")).toBe("太字");
  });

  it("scriptタグを除去する（XSS対策）", () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe(
      'alert("xss")'
    );
  });

  it("scriptタグ + 属性を除去する", () => {
    expect(
      sanitizeString('<script type="text/javascript">evil()</script>')
    ).toBe("evil()");
  });

  it("imgタグのonerrorを除去する", () => {
    expect(sanitizeString('<img src="x" onerror="evil()">')).toBe("");
  });

  it("aタグのhrefを除去する", () => {
    expect(sanitizeString('<a href="http://evil.com">リンク</a>')).toBe(
      "リンク"
    );
  });

  it("ネストしたタグを除去する", () => {
    expect(sanitizeString("<div><p>テキスト</p></div>")).toBe("テキスト");
  });

  it("通常のテキストはそのまま返す", () => {
    expect(sanitizeString("普通のテキスト")).toBe("普通のテキスト");
  });

  it("前後の空白をtrimする", () => {
    expect(sanitizeString("  前後に空白  ")).toBe("前後に空白");
  });

  it("タグ除去後の空白もtrimする", () => {
    expect(sanitizeString("<b>  テキスト  </b>")).toBe("テキスト");
  });

  it("空文字列: そのまま空文字を返す", () => {
    expect(sanitizeString("")).toBe("");
  });

  it("タグのみ: 空文字を返す", () => {
    expect(sanitizeString("<br/>")).toBe("");
  });

  it("number型: 空文字を返す（文字列以外はガード）", () => {
    expect(sanitizeString(123)).toBe("");
  });

  it("null: 空文字を返す", () => {
    expect(sanitizeString(null)).toBe("");
  });

  it("undefined: 空文字を返す", () => {
    expect(sanitizeString(undefined)).toBe("");
  });

  it("オブジェクト: 空文字を返す", () => {
    expect(sanitizeString({ key: "value" })).toBe("");
  });

  it("日本語テキストはそのまま保持する", () => {
    expect(sanitizeString("山梨県上野原市")).toBe("山梨県上野原市");
  });

  it("改行・タブを含むテキストはタグだけ除去してtrimする", () => {
    expect(sanitizeString("  <b>テキスト</b>  ")).toBe("テキスト");
  });
});

// ─── isValidEmail ─────────────────────────────────────────────────────────────

describe("isValidEmail", () => {
  it("有効なメールアドレス: true", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("サブドメインあり: true", () => {
    expect(isValidEmail("user@mail.example.co.jp")).toBe(true);
  });

  it("プラス記号あり: true", () => {
    expect(isValidEmail("user+tag@example.com")).toBe(true);
  });

  it("@なし: false", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("ドメインなし: false", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("ローカルパートなし: false", () => {
    expect(isValidEmail("@example.com")).toBe(false);
  });

  it("スペースを含む: false", () => {
    expect(isValidEmail("us er@example.com")).toBe(false);
  });

  it("空文字: false", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("ドット区切りなし（TLDなし）: false", () => {
    expect(isValidEmail("user@examplecom")).toBe(false);
  });
});
