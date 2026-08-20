import {
  addDays,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import type { CalendarEvent } from "../types"

/** Dias da semana em pt-BR, começando na segunda-feira. */
export const WEEKDAYS_SHORT = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]

/** Ex.: "agosto de 2026" */
export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy", { locale: ptBR })
}

/** Ex.: "quinta-feira, 20 de agosto" */
export function formatDayHeader(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
}

/**
 * Grid do mês: 42 dias (6 semanas) cobrindo o mês,
 * começando na segunda-feira anterior ao dia 1.
 */
export function getMonthGrid(month: Date): Date[] {
  const start = startOfWeek(month, { weekStartsOn: 1 })
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** Chave de dia: YYYY-MM-DD. */
export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function fromDateKey(key: string): Date {
  return parseISO(key)
}

/** "14:30" ou "dia todo" quando o evento não tem hora. */
export function formatTime(time?: string): string {
  return time ?? "dia todo"
}

export function eventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  const key = toDateKey(day)
  return events
    .filter((event) => event.date === key)
    .sort((a, b) => (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99"))
}

export function sortByDate(a: CalendarEvent, b: CalendarEvent): number {
  return a.date.localeCompare(b.date)
}

export { isSameDay, isSameMonth, isToday }
