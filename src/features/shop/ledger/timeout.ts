/** A timeout is an unknown external outcome, never proof of rejection. */
export async function boundedExternal<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw new Error("INVALID_TIMEOUT");
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([operation(), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("EXTERNAL_OUTCOME_UNKNOWN")), timeoutMs); })]);
  } finally { if (timer) clearTimeout(timer); }
}
