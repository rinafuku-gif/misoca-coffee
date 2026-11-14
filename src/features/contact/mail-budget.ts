/** Best-effort send guard for one server instance. It keeps a script from
 * spending the Gmail account that reservation mail also depends on. It is not a
 * ledger shared between instances, so the real ceiling is higher under load. */
const visitorRule = { limit: 3, windowMs: 10 * 60_000 };
const overallRules = [{ limit: 20, windowMs: 60 * 60_000 }, { limit: 60, windowMs: 24 * 60 * 60_000 }];
const longest = 24 * 60 * 60_000;
let sent: number[] = [];
const visitors = new Map<string, number[]>();

function within(times: number[], now: number, windowMs: number) {
  return times.filter(at => now - at < windowMs).length;
}
function allowed(visitor: string, now: number) {
  if (overallRules.some(rule => within(sent, now, rule.windowMs) >= rule.limit)) return false;
  return within(visitors.get(visitor) ?? [], now, visitorRule.windowMs) < visitorRule.limit;
}
export const shopMailBudget = {
  /** Counts an attempt, sent or not: a failing send still reaches Gmail. */
  take(visitor: string, now = Date.now()) {
    sent = sent.filter(at => now - at < longest);
    for (const [key, times] of visitors) {
      const kept = times.filter(at => now - at < visitorRule.windowMs);
      if (kept.length) visitors.set(key, kept); else visitors.delete(key);
    }
    if (!allowed(visitor, now)) return false;
    sent.push(now); visitors.set(visitor, [...(visitors.get(visitor) ?? []), now]);
    return true;
  },
  reset() { sent = []; visitors.clear(); },
};
