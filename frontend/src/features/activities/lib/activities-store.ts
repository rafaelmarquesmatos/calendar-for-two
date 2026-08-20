import type { Activity } from "../types"
import type { CalendarEvent } from "@/features/calendar/types"

const ACTIVITIES_KEY = "calendar-for-two:activities"
const EVENTS_KEY = "calendar-for-two:events"
const MIGRATION_KEY = "calendar-for-two:migrated:activities-v1"

/**
 * Persistência local das atividades.
 * Sem backend ainda — localStorage, como os eventos.
 */
export function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Activity[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveActivities(activities: Activity[]): void {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities))
  } catch {
    // quota excedida ou storage indisponível — falha silenciosa por ora
  }
}

/**
 * Migração única: eventos antigos com type === "personal" (o modelo anterior
 * misturava eventos e ocupações) viram atividades. A grade semanal é derivada
 * do dia da semana da data base do evento.
 *
 * Roda uma única vez (flag MIGRATION_KEY). Retorna as atividades migradas
 * para o hook inicializar o estado.
 */
export function migratePersonalEvents(): Activity[] {
  if (localStorage.getItem(MIGRATION_KEY)) return loadActivities()

  let raw: string | null = null
  try {
    raw = localStorage.getItem(EVENTS_KEY)
  } catch {
    raw = null
  }
  if (!raw) {
    try {
      localStorage.setItem(MIGRATION_KEY, "1")
    } catch {
      // storage indisponível — tentará de novo na próxima carga
    }
    return []
  }

  const events = JSON.parse(raw) as CalendarEvent[]
  const personal = events.filter((event) => event.type === "personal")
  const activities: Activity[] = personal.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    weekdays: [new Date(`${event.date}T00:00:00`).getDay()],
    startTime: event.startTime,
    endTime: event.endTime,
    category: event.category,
    ownerId: event.authorId,
    createdAt: event.createdAt,
  }))

  // Remove os personal dos eventos e o campo type de todos
  const remaining = events
    .filter((event) => event.type !== "personal")
    .map(({ type: _type, ...rest }) => rest)

  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(remaining))
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities))
    localStorage.setItem(MIGRATION_KEY, "1")
  } catch {
    // falha ao persistir — a migração roda de novo na próxima carga
  }
  return activities
}
