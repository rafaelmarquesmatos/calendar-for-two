import { useCallback, useEffect, useState } from "react"
import type { CalendarEvent, EventInput } from "../types"
import { loadEvents, saveEvents } from "../lib/events-store"
import { sortByDate } from "../lib/calendar-utils"

/**
 * Estado global (por enquanto local ao hook) dos eventos do casal,
 * com persistência automática em localStorage.
 *
 * @param fallbackAuthorId autor atribuído a eventos antigos sem authorId.
 */
export function useEvents(fallbackAuthorId?: string) {
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    loadEvents(fallbackAuthorId),
  )

  useEffect(() => {
    saveEvents(events)
  }, [events])

  const addEvent = useCallback((input: EventInput): CalendarEvent => {
    const event: CalendarEvent = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => [...prev, event].sort(sortByDate))
    return event
  }, [])

  const updateEvent = useCallback(
    (id: string, patch: Partial<EventInput>): void => {
      setEvents((prev) =>
        prev
          .map((event) => (event.id === id ? { ...event, ...patch } : event))
          .sort(sortByDate),
      )
    },
    [],
  )

  const deleteEvent = useCallback((id: string): void => {
    setEvents((prev) => prev.filter((event) => event.id !== id))
  }, [])

  /** Aceita (ou desfaz aceite) de um evento compartilhado. */
  const toggleAccept = useCallback((id: string): void => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? {
              ...event,
              accepted: !event.accepted,
              acceptedAt: event.accepted ? undefined : new Date().toISOString(),
            }
          : event,
      ),
    )
  }, [])

  return { events, addEvent, updateEvent, deleteEvent, toggleAccept }
}
