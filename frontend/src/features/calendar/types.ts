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

/**
 * - shared: plano do casal — o parceiro pode aceitar.
 * - personal: ocupação pessoal (ex.: trabalho) — só o dono, sem aceite.
 */
export type EventType = "shared" | "personal"

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
  /** shared = plano do casal | personal = ocupação pessoal. */
  type: EventType
  /** Quem criou / é dono do evento (id do membro). */
  authorId: string
  /** Aceite do parceiro (apenas para eventos shared). */
  accepted?: boolean
  acceptedAt?: string
  /** Recorrência semanal (ex.: trabalho toda segunda). */
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
