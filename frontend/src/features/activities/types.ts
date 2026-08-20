/**
 * Tipos da feature activities — rotinas pessoais de ocupação (ex.: trabalho).
 * Diferente de eventos: atividades são uma grade semanal (dias da semana +
 * horário), não uma data com recorrência. Não têm aceite.
 */

import type { EventCategory } from "@/lib/categories"

export interface Activity {
  id: string
  title: string
  description?: string
  /**
   * Dias da semana em que a atividade ocorre.
   * Convenção JS: 0 = domingo ... 6 = sábado.
   */
  weekdays: number[]
  /** Hora de início opcional no formato HH:mm. */
  startTime?: string
  /** Hora de término opcional no formato HH:mm. */
  endTime?: string
  category: EventCategory
  /** Dono da ocupação (id do membro). */
  ownerId: string
  createdAt: string
}

export type ActivityInput = Omit<Activity, "id" | "createdAt">

/**
 * Ocorrência de uma atividade num dia específico.
 */
export interface DayActivity extends Activity {
  /** Chave única da ocorrência: `${activity.id}:${date}`. */
  instanceKey: string
  /** Data desta ocorrência (YYYY-MM-DD). */
  instanceDate: string
}
