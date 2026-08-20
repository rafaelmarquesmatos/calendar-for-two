import { useCallback, useState } from "react"
import type { Member, MemberColor } from "../types"
import {
  loadActiveMemberId,
  loadMembers,
  saveActiveMemberId,
  saveMembers,
} from "../lib/members-store"

/**
 * Estado dos membros do casal e de quem está "visualizando" o app agora.
 * O seletor de perfil ativo permite simular os dois lados do casal
 * enquanto não existe autenticação.
 */
export function useMembers() {
  const [members, setMembers] = useState<Member[]>(() => loadMembers())
  const [activeMemberId, setActiveMemberId] = useState<string | null>(() =>
    loadActiveMemberId(),
  )

  const activeMember = members.find((m) => m.id === activeMemberId) ?? null
  const partner = members.find((m) => m.id !== activeMember?.id) ?? null

  const setup = useCallback((names: [string, string]) => {
    const colors: [MemberColor, MemberColor] = ["rose", "sky"]
    const newMembers: Member[] = names.map((name, index) => ({
      id: crypto.randomUUID(),
      name: name.trim(),
      color: colors[index],
      index: index as 0 | 1,
    }))
    setMembers(newMembers)
    saveMembers(newMembers)
    setActiveMemberId(newMembers[0].id)
    saveActiveMemberId(newMembers[0].id)
  }, [])

  const switchActiveMember = useCallback((id: string) => {
    setActiveMemberId(id)
    saveActiveMemberId(id)
  }, [])

  return { members, activeMember, partner, setup, switchActiveMember }
}
