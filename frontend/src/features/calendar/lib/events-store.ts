import type { CalendarEvent } from "../types"

const STORAGE_KEY = "calendar-for-two:events"

/**
 * Persistência local dos eventos.
 * Sem backend ainda — os dados vivem no localStorage do navegador.
 * Quando o backend existir, esta camada é substituída por chamadas de API
 * mantendo a mesma assinatura (lib/events-store -> lib/api).
 */
export function loadEvents(fallbackAuthorId?: string): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CalendarEvent[]
    return Array.isArray(parsed)
      ? parsed.map((e) => normalizeEvent(e, fallbackAuthorId))
      : []
  } catch {
    return []
  }
}

/**
 * Normaliza eventos salvos por versões antigas do app
 * (campos novos: type, authorId, repeat; accepted opcional).
 */
function normalizeEvent(
  event: CalendarEvent,
  fallbackAuthorId?: string,
): CalendarEvent {
  return {
    ...event,
    type: event.type ?? "shared",
    repeat: event.repeat ?? "none",
    authorId: event.authorId ?? fallbackAuthorId ?? "unknown",
  }
}

export function saveEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {
    // quota excedida ou storage indisponível — falha silenciosa por ora
  }
}
