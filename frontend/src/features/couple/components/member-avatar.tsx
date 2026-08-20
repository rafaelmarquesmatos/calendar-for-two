import { MEMBER_COLORS, memberInitials } from "../types"
import type { Member } from "../types"

interface MemberAvatarProps {
  member: Member
  className?: string
}

/** Avatar com as iniciais do membro e a cor dele. */
export function MemberAvatar({ member, className = "" }: MemberAvatarProps) {
  const color = MEMBER_COLORS[member.color]?.avatar ?? "bg-slate-500 text-white"
  return (
    <span
      title={member.name}
      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${color} ${className}`}
    >
      {memberInitials(member.name)}
    </span>
  )
}
