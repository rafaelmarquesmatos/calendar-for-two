import { useCallback, useEffect, useState } from "react"
import type { CalendarEvent, EventInput } from "../types"
import { loadEvents, saveEvents } from "../lib/events-store"
import { sortByDate } from "../lib/calendar-utils"

/**
 * Estado global (por enquanto local ao hook) dos eventos do casal,
 * com persistência automática em localStorage.
 */
export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadEvents())

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

  return { events, addEvent, updateEvent, deleteEvent }
}
