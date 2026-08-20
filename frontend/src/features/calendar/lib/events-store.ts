import type { CalendarEvent } from "../types"

const STORAGE_KEY = "calendar-for-two:events"

/** Formato legado (pré-separação): eventos podiam ser "personal". */
type LegacyEvent = CalendarEvent & { type?: "shared" | "personal" }

/**
 * Persistência local dos eventos do casal.
 * Sem backend ainda — localStorage. Quando o backend existir, esta camada é
 * substituída por chamadas de API mantendo a mesma assinatura.
 */
export function loadEvents(fallbackAuthorId?: string): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LegacyEvent[]
    return Array.isArray(parsed)
      ? parsed
          .filter((event) => event.type !== "personal")
          .map(({ type: _type, ...rest }) => normalizeEvent(rest, fallbackAuthorId))
      : []
  } catch {
    return []
  }
}

/**
 * Normaliza eventos salvos por versões antigas do app
 * (campos novos: repeat; authorId opcional).
 */
function normalizeEvent(
  event: CalendarEvent,
  fallbackAuthorId?: string,
): CalendarEvent {
  return {
    ...event,
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
