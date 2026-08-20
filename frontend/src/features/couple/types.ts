/**
 * Tipos da feature couple — os dois membros do casal.
 * Sem backend ainda: os perfis são locais (localStorage) e o app permite
 * alternar "visualizando como" para simular os dois lados.
 */

export type MemberColor = "rose" | "sky" | "emerald" | "amber" | "violet"

export interface Member {
  id: string
  name: string
  color: MemberColor
  /** Posição no casal: 0 = usuário principal, 1 = parceiro(a). */
  index: 0 | 1
}

export const MEMBER_COLORS: Record<
  MemberColor,
  { avatar: string; dot: string }
> = {
  rose: {
    avatar: "bg-rose-500 text-white",
    dot: "bg-rose-500",
  },
  sky: {
    avatar: "bg-sky-500 text-white",
    dot: "bg-sky-500",
  },
  emerald: {
    avatar: "bg-emerald-500 text-white",
    dot: "bg-emerald-500",
  },
  amber: {
    avatar: "bg-amber-500 text-white",
    dot: "bg-amber-500",
  },
  violet: {
    avatar: "bg-violet-500 text-white",
    dot: "bg-violet-500",
  },
}

export function memberInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
