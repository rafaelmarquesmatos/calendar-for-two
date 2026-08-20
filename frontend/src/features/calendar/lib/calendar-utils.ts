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
import type { CalendarEvent, DayEvent } from "../types"

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

function toInstance(event: CalendarEvent, dayKey: string): DayEvent {
  return {
    ...event,
    instanceKey: `${event.id}:${dayKey}`,
    instanceDate: dayKey,
  }
}

/** Mesmo dia da semana? (para recorrência semanal) */
function sameWeekday(a: Date, b: Date): boolean {
  return a.getDay() === b.getDay()
}

/**
 * Expande os eventos (inclusive recorrentes semanais) para as ocorrências
 * dentro do grid do mês exibido.
 */
export function expandEventsForMonth(
  events: CalendarEvent[],
  month: Date,
): DayEvent[] {
  const grid = getMonthGrid(month)
  const result: DayEvent[] = []
  for (const event of events) {
    const originalDate = fromDateKey(event.date)
    for (const day of grid) {
      const dayKey = toDateKey(day)
      if (event.repeat === "weekly") {
        if (sameWeekday(day, originalDate) && dayKey >= event.date) {
          result.push(toInstance(event, dayKey))
        }
      } else if (dayKey === event.date) {
        result.push(toInstance(event, dayKey))
      }
    }
  }
  return result
}

/**
 * Próximas N ocorrências (respeitando recorrência semanal)
 * a partir de uma data. Horizonte de busca: 90 dias.
 */
export function nextInstances(
  events: CalendarEvent[],
  fromDate: Date,
  limit = 5,
): DayEvent[] {
  const result: DayEvent[] = []
  const horizon = addDays(fromDate, 90)
  let cursor = fromDate
  while (cursor <= horizon && result.length < limit) {
    const dayKey = toDateKey(cursor)
    const dayInstances = events
      .filter((event) => {
        if (event.repeat === "weekly") {
          return (
            sameWeekday(cursor, fromDateKey(event.date)) && dayKey >= event.date
          )
        }
        return event.date === dayKey
      })
      .sort(byEventTime)
    for (const event of dayInstances) {
      if (result.length >= limit) break
      result.push(toInstance(event, dayKey))
    }
    cursor = addDays(cursor, 1)
  }
  return result
}

/** Ocorrências de um dia específico (a partir do mês já expandido). */
export function dayInstances(instances: DayEvent[], day: Date): DayEvent[] {
  const key = toDateKey(day)
  return instances
    .filter((instance) => instance.instanceDate === key)
    .sort(byEventTime)
}

function byEventTime(a: { startTime?: string }, b: { startTime?: string }) {
  return (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99")
}

export function sortByDate(a: CalendarEvent, b: CalendarEvent): number {
  return a.date.localeCompare(b.date)
}

export { isSameDay, isSameMonth, isToday }
