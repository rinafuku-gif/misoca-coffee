import nodemailer from "nodemailer";
import { expect, it } from "vitest";
import { contactInputSchema } from "../contract";
import { inquiryMail, shopInbox } from "../shop-mail";

const id = "44444444-4444-4444-8444-444444444444";

// Builds the real message with the installed mail library, without a network.
it("名前や本文に改行と宛先の行を入れても、届け先は店の受信箱だけで、ヘッダは増えない", async () => {
  const hostile = { attemptId: id, type: "その他" as const, name: "架空\r\nBcc: victim@example.invalid", email: "visitor@example.invalid", phone: "0\r\nCc: victim@example.invalid", message: "本文\r\nBcc: victim@example.invalid" };
  const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "unix" });
  const info = await transport.sendMail(inquiryMail(hostile, "sender@example.invalid"));
  expect(info.envelope).toEqual({ from: "sender@example.invalid", to: [shopInbox] });
  const head = String(info.message).split("\n\n")[0];
  expect(head).toMatch(/^To: misocacoffee@gmail\.com$/m);
  expect(head).toMatch(/^Reply-To: visitor@example\.invalid$/m);
  expect(head).not.toMatch(/^(Bcc|Cc):/im);
  expect(head).not.toContain("victim");
});
it("メールアドレスの欄に改行と宛先の行を入れた入力は、受け付けない", () => {
  const input = { attemptId: id, type: "その他", name: "架空", email: "visitor@example.invalid\r\nBcc: victim@example.invalid", phone: "", message: "本文" };
  expect(contactInputSchema.safeParse(input).success).toBe(false);
});
