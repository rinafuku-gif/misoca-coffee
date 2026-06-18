/**
 * 共通バリデーション・サニタイズユーティリティ
 */

/**
 * 文字列サニタイズ（XSS対策: HTMLタグを除去）
 * reservation/route.ts と reservation/cancel/route.ts の両方で使用
 */
export function sanitizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").trim();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
