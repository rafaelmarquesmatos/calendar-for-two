/**
 * Categorias visuais compartilhadas entre eventos e atividades.
 */

export type EventCategory =
  | "romance"
  | "aniversario"
  | "viagem"
  | "compromisso"
  | "saude"
  | "outro"

/**
 * Metadados visuais das categorias.
 * Classes Tailwind fixas (com variantes dark) — não usar classes dinâmicas.
 */
export const CATEGORIES: Record<
  EventCategory,
  { label: string; dot: string; badge: string }
> = {
  romance: {
    label: "Romance",
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
  aniversario: {
    label: "Aniversário",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  viagem: {
    label: "Viagem",
    dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  compromisso: {
    label: "Compromisso",
    dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  saude: {
    label: "Saúde",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  outro: {
    label: "Outro",
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
}

export const CATEGORY_ORDER = Object.keys(CATEGORIES) as EventCategory[]
