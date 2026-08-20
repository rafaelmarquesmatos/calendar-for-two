import { addDays, startOfWeek } from "date-fns"
import { toDateKey } from "@/features/calendar/lib/calendar-utils"
import type { Activity, DayActivity } from "../types"

/** Ordem de exibição pt-BR (segunda como primeiro dia da semana). */
export const WEEKDAYS_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

/**
 * Expande as atividades para as ocorrências dentro do grid do mês exibido.
 * Atividades não têm data base — valem em todos os dias cujo weekday está
 * em `weekdays`.
 */
export function expandActivitiesForMonth(
  activities: Activity[],
  month: Date,
): DayActivity[] {
  const start = startOfWeek(month, { weekStartsOn: 1 })
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const result: DayActivity[] = []
  for (const activity of activities) {
    for (const day of days) {
      if (activity.weekdays.includes(day.getDay())) {
        const dayKey = toDateKey(day)
        result.push({
          ...activity,
          instanceKey: `${activity.id}:${dayKey}`,
          instanceDate: dayKey,
        })
      }
    }
  }
  return result
}

/** Ocorrências de um dia específico (a partir do mês já expandido). */
export function dayActivities(
  instances: DayActivity[],
  day: Date,
): DayActivity[] {
  const key = toDateKey(day)
  return instances
    .filter((instance) => instance.instanceDate === key)
    .sort((a, b) =>
      (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99"),
    )
}

/** Ex.: "seg · qua" para [1, 3]. */
export function formatWeekdays(weekdays: number[]): string {
  const labels = WEEKDAYS_ORDER.filter((d) => weekdays.includes(d)).map(
    (d) => WEEKDAYS_SHORT[d],
  )
  return labels.length > 0 ? labels.join(" · ") : "—"
}
