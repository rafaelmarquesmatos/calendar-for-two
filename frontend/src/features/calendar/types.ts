/**
 * Tipos de domínio da feature calendar — eventos do casal.
 * Ocupações pessoais/rotinas vivem na feature `activities`.
 */

import type { EventCategory } from "@/lib/categories"

export type { EventCategory }

export type RepeatRule = "none" | "weekly"

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
  /** Quem marcou o evento (id do membro). */
  authorId: string
  /** Aceite do parceiro. */
  accepted?: boolean
  acceptedAt?: string
  /** Recorrência semanal (ex.: jantar toda sexta). */
  repeat: RepeatRule
  createdAt: string
}

export type EventInput = Omit<CalendarEvent, "id" | "createdAt">

/**
 * Ocorrência de um evento num dia específico.
 * Eventos com repeat "weekly" geram várias ocorrências a partir da data base.
 */
export interface DayEvent extends CalendarEvent {
  /** Chave única da ocorrência: `${event.id}:${date}` — usada em listas React. */
  instanceKey: string
  /** Data desta ocorrência (YYYY-MM-DD). */
  instanceDate: string
}
