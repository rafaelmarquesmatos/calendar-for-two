import type { Member } from "../types"

const MEMBERS_KEY = "calendar-for-two:members"
const ACTIVE_KEY = "calendar-for-two:active-member"

/**
 * Persistência local dos membros do casal.
 * Sem backend: o "usuário" é um perfil local neste dispositivo.
 */
export function loadMembers(): Member[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Member[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveMembers(members: Member[]): void {
  try {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
  } catch {
    // falha silenciosa por ora
  }
}

export function loadActiveMemberId(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}

export function saveActiveMemberId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id)
}
