import { describe, expect, it } from "vitest";
import { buildCalendarCells, type StandEvent } from "../calendar";

const slot = (date: string, startTime: string, endTime: string, description = ""): StandEvent =>
  ({ date, startTime, endTime, description });
const day = (events: StandEvent[], date = 7) =>
  buildCalendarCells(2026, 10, events).find((cell) => cell.isCurrentMonth && cell.date.getDate() === date)!;

describe("stand calendar opening slots", () => {
  it("keeps morning and afternoon slots on every affected October date", () => {
    const events = ["07", "21", "28"].flatMap((date) => [
      slot(`2026-10-${date}`, "08:00", "09:30"),
      slot(`2026-10-${date}`, "10:30", "16:00"),
    ]);
    for (const date of [7, 21, 28]) {
      expect(day(events, date).events.map((event) => `${event.startTime}-${event.endTime}`))
        .toEqual(["08:00-09:30", "10:30-16:00"]);
    }
  });

  it("preserves a single nonstandard opening slot and its description", () => {
    const event = slot("2026-10-07", "11:15", "14:45", "営業時間変更");
    expect(day([event]).events).toEqual([event]);
  });

  it("leaves closed days empty", () => {
    expect(day([slot("2026-10-21", "08:00", "09:30")]).events).toEqual([]);
  });

  it("sorts reversed API order without changing the source array", () => {
    const afternoon = slot("2026-10-07", "10:30", "16:00", "午後");
    const morning = slot("2026-10-07", "08:00", "09:30", "朝");
    const events = [afternoon, morning];
    expect(day(events).events).toEqual([morning, afternoon]);
    expect(events).toEqual([afternoon, morning]);
  });

  it("retains more than two slots instead of hardcoding two opening periods", () => {
    const events = [slot("2026-10-07", "17:00", "18:00"), slot("2026-10-07", "08:00", "09:30"),
      slot("2026-10-07", "10:30", "16:00")];
    expect(day(events).events.map((event) => event.startTime)).toEqual(["08:00", "10:30", "17:00"]);
  });

  it("keeps adjacent-month cells empty even when the API includes their events", () => {
    const cells = buildCalendarCells(2026, 10, [slot("2026-09-30", "08:00", "09:30"),
      slot("2026-11-01", "10:30", "16:00")]);
    expect(cells).toHaveLength(42);
    expect(cells[0].date.getDay()).toBe(1);
    expect(cells.filter((cell) => !cell.isCurrentMonth).every((cell) => cell.events.length === 0)).toBe(true);
  });

  it("keeps month lengths and year boundaries correct", () => {
    for (const [year, month, count] of [[2024, 2, 29], [2026, 2, 28], [2026, 12, 31], [2027, 1, 31]]) {
      const cells = buildCalendarCells(year, month, []);
      expect(cells).toHaveLength(42);
      expect(cells.filter((cell) => cell.isCurrentMonth)).toHaveLength(count);
      for (let index = 1; index < cells.length; index++) {
        const previous = new Date(cells[index - 1].date);
        previous.setDate(previous.getDate() + 1);
        expect(cells[index].date).toEqual(previous);
      }
    }
  });
});
