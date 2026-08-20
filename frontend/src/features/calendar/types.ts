/**
 * Tipos de domínio da feature calendar.
 */

export type EventCategory =
  | "romance"
  | "aniversario"
  | "viagem"
  | "compromisso"
  | "saude"
  | "outro"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  /** Data do evento no formato YYYY-MM-DD (chave de dia). */
  date: string
  /** Hora de início opcional no formato HH:mm. */
  startTime?: string
  /** Hora de término opcional no formato HH:mm. */
  endTime?: string
  category: EventCategory
  createdAt: string
}

export type EventInput = Omit<CalendarEvent, "id" | "createdAt">
