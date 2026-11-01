import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import InfoPage, { metadata } from "../management-login-info/page";
import PrivacyPage from "../privacy/page";
const siteOrigin = "https://misoca-coffee.vercel.app";

describe("management login disclosure candidate", () => {
  it("explains sender-only Google access without presenting a live login or sending action", () => {
    const html = renderToStaticMarkup(<InfoPage />);
    expect(html).toContain("当店の差出人アカウントだけ");
    expect(html).toContain("現在は接続を準備しています");
    expect(html).toContain("受信箱、連絡先、カレンダーを読む接続ではありません");
    expect(html).not.toMatch(/<form|<input|<button/);
    expect(html).toContain('href="/privacy#management-login"');
    expect(html).toContain('href="/terms"');
    expect(html).toContain('href="mailto:misocacoffee@gmail.com"');
    expect(metadata.alternates?.canonical).toBe(siteOrigin + "/management-login-info");
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
  it("discloses send-only use, limitations and revocation without claiming automatic deletion", () => {
    const html = renderToStaticMarkup(<PrivacyPage />);
    expect(html).toContain('id="management-login"');
    expect(html).toContain("Gmail APIの送信専用権限");
    expect(html).toContain("受取人のGmailへのアクセスを求めるものではありません");
    expect(html).toContain("汎用AIモデルの学習に利用したりしません");
    expect(html).toContain("Limited Use要件");
    expect(html).toContain("対象アプリへのアクセスを取り消す");
    expect(html).toContain("削除については、上記の連絡先へお問い合わせください");
    expect(html).not.toContain("自動で削除");
  });
});
