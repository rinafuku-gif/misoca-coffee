import { beforeEach, expect, it } from "vitest";
import { shopMailBudget } from "../mail-budget";

const minute = 60_000, hour = 60 * minute;
beforeEach(() => shopMailBudget.reset());

it("同じ訪問者は10分に3通まで。10分たてばまた送れる", () => {
  expect([0, 1, 2].map(at => shopMailBudget.take("a", at))).toEqual([true, true, true]);
  expect(shopMailBudget.take("a", 3)).toBe(false);
  expect(shopMailBudget.take("b", 3)).toBe(true);
  expect(shopMailBudget.take("a", 10 * minute + 2)).toBe(true);
});
it("全体では1時間に20通まで。1時間たてばまた送れる", () => {
  for (let n = 0; n < 20; n++) expect(shopMailBudget.take(`v${n}`, n)).toBe(true);
  expect(shopMailBudget.take("new", 100)).toBe(false);
  expect(shopMailBudget.take("new", hour + 19)).toBe(true);
});
it("全体では24時間に60通まで", () => {
  for (let batch = 0; batch < 3; batch++) for (let n = 0; n < 20; n++) expect(shopMailBudget.take(`v${batch}-${n}`, batch * hour + n)).toBe(true);
  expect(shopMailBudget.take("new", 3 * hour + 30)).toBe(false);
  expect(shopMailBudget.take("new", 24 * hour + 19)).toBe(true);
});
