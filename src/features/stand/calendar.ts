export interface StandEvent {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  description: string;
}

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  events: StandEvent[];
}

export function buildCalendarCells(year: number, month: number, events: StandEvent[]): DayCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const endDow = (lastDay.getDay() + 6) % 7;
  const cells: DayCell[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, -i), isCurrentMonth: false, events: [] });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month - 1, d);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayEvents = events
      .filter((event) => event.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime));
    cells.push({ date, isCurrentMonth: true, events: dayEvents });
  }

  const remaining = (7 - ((endDow + 1) % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ date: new Date(year, month, i), isCurrentMonth: false, events: [] });
  }

  while (cells.length < 42) {
    const date = new Date(cells[cells.length - 1].date);
    date.setDate(date.getDate() + 1);
    cells.push({ date, isCurrentMonth: false, events: [] });
  }

  return cells;
}
