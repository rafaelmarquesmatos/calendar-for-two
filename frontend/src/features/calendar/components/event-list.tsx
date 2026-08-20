import { CalendarDays, Check, Plus, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MemberAvatar } from "@/features/couple/components/member-avatar"
import { CATEGORIES } from "@/lib/categories"
import {
  dayInstances,
  formatDayHeader,
  formatTime,
  nextInstances,
} from "../lib/calendar-utils"
import type { Member } from "@/features/couple/types"
import type { CalendarEvent, DayEvent } from "../types"

interface EventListProps {
  selectedDate: Date
  /** Ocorrências expandidas do mês (para o dia selecionado). */
  instances: DayEvent[]
  events: CalendarEvent[]
  members: Member[]
  activeMember: Member
  onNewEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent, date: Date) => void
  onToggleAccept: (id: string) => void
}

export function EventList({
  selectedDate,
  instances,
  events,
  members,
  activeMember,
  onNewEvent,
  onEditEvent,
  onToggleAccept,
}: EventListProps) {
  const dayEvents = dayInstances(instances, selectedDate)
  const upcoming = nextInstances(events, selectedDate, 5)

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Eventos do dia selecionado */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium capitalize text-muted-foreground">
            {formatDayHeader(selectedDate)}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNewEvent(selectedDate)}
          >
            <Plus className="size-3.5" />
            Novo
          </Button>
        </div>

        {dayEvents.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Nenhum evento neste dia.
          </p>
        ) : (
          <ul className="space-y-2">
            {dayEvents.map((instance) => (
              <li key={instance.instanceKey}>
                <DayEventCard
                  instance={instance}
                  members={members}
                  activeMember={activeMember}
                  onEdit={() =>
                    onEditEvent(instance, new Date(`${instance.instanceDate}T00:00:00`))
                  }
                  onToggleAccept={() => onToggleAccept(instance.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      {/* Próximos eventos */}
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="size-4" />
          Próximos eventos
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nada agendado para frente. Aproveitem o dia!
          </p>
        ) : (
          <ScrollArea className="max-h-64">
            <ul className="space-y-2 pr-2">
              {upcoming.map((instance) => {
                const author = members.find((m) => m.id === instance.authorId)
                return (
                  <li key={instance.instanceKey}>
                    <button
                      onClick={() =>
                        onEditEvent(
                          instance,
                          new Date(`${instance.instanceDate}T00:00:00`),
                        )
                      }
                      className="flex w-full items-start gap-2 rounded-md border bg-card p-3 text-left transition-colors hover:bg-muted/60"
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${CATEGORIES[instance.category].dot}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {instance.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {new Date(
                            `${instance.instanceDate}T00:00:00`,
                          ).toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                          {instance.repeat === "weekly" ? " · semanal" : ""}
                          {author ? ` · ${author.name}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatTime(instance.startTime)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </section>
    </div>
  )
}

interface DayEventCardProps {
  instance: DayEvent
  members: Member[]
  activeMember: Member
  onEdit: () => void
  onToggleAccept: () => void
}

function DayEventCard({
  instance,
  members,
  activeMember,
  onEdit,
  onToggleAccept,
}: DayEventCardProps) {
  const author = members.find((m) => m.id === instance.authorId)
  const isPersonal = instance.type === "personal"
  const iAmAuthor = instance.authorId === activeMember.id
  const isShared = !isPersonal

  const acceptState = !isShared
    ? null
    : instance.accepted
      ? "accepted"
      : iAmAuthor
        ? "mine"
        : "pending"

  return (
    <div
      className={`rounded-md border bg-card p-3 transition-colors hover:bg-muted/60 ${
        isPersonal ? "border-dashed" : ""
      }`}
      style={
        isPersonal
          ? {
              backgroundImage:
                "repeating-linear-gradient(45deg, color-mix(in oklab, var(--muted) 40%, transparent) 0 4px, transparent 4px 8px)",
            }
          : undefined
      }
    >
      <button onClick={onEdit} className="flex w-full items-start gap-2 text-left">
        <span
          className={`mt-1.5 size-2 shrink-0 rounded-full ${CATEGORIES[instance.category].dot}`}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{instance.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {CATEGORIES[instance.category].label}
            {instance.description ? ` · ${instance.description}` : ""}
            {instance.repeat === "weekly" ? " · semanal" : ""}
          </span>
        </span>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatTime(instance.startTime)}
        </span>
      </button>

      <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          {author ? (
            <>
              <MemberAvatar member={author} className="size-4 text-[8px]" />
              {isPersonal ? (
                <span className="truncate">
                  {author.name} · ocupação
                </span>
              ) : (
                <span className="truncate">marcado por {author.name}</span>
              )}
            </>
          ) : (
            <>
              <UserRound className="size-3.5" />
              <span>autor desconhecido</span>
            </>
          )}
        </span>

        {isShared && acceptState && (
          <AcceptButton
            state={acceptState}
            partnerName={members.find((m) => m.id !== activeMember.id)?.name}
            onToggle={onToggleAccept}
          />
        )}
      </div>
    </div>
  )
}

function AcceptButton({
  state,
  partnerName,
  onToggle,
}: {
  state: "accepted" | "mine" | "pending"
  partnerName?: string
  onToggle: () => void
}) {
  if (state === "accepted") {
    return (
      <Badge
        variant="secondary"
        className="gap-1 text-emerald-600 dark:text-emerald-400"
      >
        <Check className="size-3" />
        Aceito{partnerName ? ` por ${partnerName.split(" ")[0]}` : ""}
      </Badge>
    )
  }
  if (state === "mine") {
    return (
      <span className="text-[11px] text-muted-foreground">
        aguardando {partnerName?.split(" ")[0]} aceitar
      </span>
    )
  }
  return (
    <Button size="sm" variant="outline" onClick={onToggle}>
      <Check className="size-3.5" />
      Aceitar
    </Button>
  )
}
