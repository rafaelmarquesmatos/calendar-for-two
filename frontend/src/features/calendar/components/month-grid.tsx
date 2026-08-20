import {
  Cake,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Heart,
  HeartPulse,
  Plane,
  Plus,
  Repeat,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MemberAvatar } from "@/features/couple/components/member-avatar"
import { dayActivities } from "@/features/activities/lib/activity-utils"
import { CATEGORIES } from "@/lib/categories"
import {
  WEEKDAYS_SHORT,
  dayInstances,
  formatMonthYear,
  formatTime,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  isToday,
  toDateKey,
} from "../lib/calendar-utils"
import type { Member } from "@/features/couple/types"
import type { DayActivity } from "@/features/activities/types"
import type { CalendarEvent, DayEvent } from "../types"

const MAX_VISIBLE_ITEMS = 2

interface MonthGridProps {
  currentMonth: Date
  selectedDate: Date
  /** Ocorrências expandidas de eventos do mês (inclui recorrentes). */
  instances: DayEvent[]
  /** Ocorrências expandidas de atividades do mês. */
  activityInstances: DayActivity[]
  members: Member[]
  onSelectDate: (date: Date) => void
  onNavigate: (direction: -1 | 1) => void
  onGoToToday: () => void
  onNewEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent, date: Date) => void
  onEditActivity: (activity: DayActivity) => void
}

export function MonthGrid({
  currentMonth,
  selectedDate,
  instances,
  activityInstances,
  members,
  onSelectDate,
  onNavigate,
  onGoToToday,
  onNewEvent,
  onEditEvent,
  onEditActivity,
}: MonthGridProps) {
  const days = getMonthGrid(currentMonth)

  return (
    <div className="w-full">
      {/* Cabeçalho do mês */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize">
          {formatMonthYear(currentMonth)}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate(-1)}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onGoToToday}>
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate(1)}
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-px border-b pb-2 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS_SHORT.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((day) => {
          const eventsOfDay = dayInstances(instances, day)
          const activitiesOfDay = dayActivities(activityInstances, day)
          const merged = [...eventsOfDay, ...activitiesOfDay].sort((a, b) =>
            (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99"),
          )
          const visible = merged.slice(0, MAX_VISIBLE_ITEMS)
          const hiddenCount = merged.length - visible.length
          const inMonth = isSameMonth(day, currentMonth)
          const selected = isSameDay(day, selectedDate)
          const today = isToday(day)

          return (
            <div
              key={toDateKey(day)}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDate(day)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectDate(day)
                }
              }}
              className={`group flex min-h-24 cursor-pointer flex-col gap-1 rounded-md border p-1.5 transition-colors sm:min-h-28 ${
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-transparent hover:border-border hover:bg-muted/50"
              } ${inMonth ? "bg-background" : "bg-muted/30 opacity-50"}`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-sm tabular-nums ${
                    today
                      ? "bg-primary font-semibold text-primary-foreground"
                      : selected
                        ? "font-semibold text-primary"
                        : "text-foreground"
                  }`}
                >
                  {day.getDate()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNewEvent(day)
                  }}
                  aria-label={`Novo evento em ${day.getDate()}`}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>

              <div className="flex flex-col gap-0.5">
                {visible.map((item) =>
                  "ownerId" in item ? (
                    <ActivityChip
                      key={item.instanceKey}
                      activity={item}
                      owner={members.find((m) => m.id === item.ownerId)}
                      onOpen={() => onEditActivity(item)}
                    />
                  ) : (
                    <EventChip
                      key={item.instanceKey}
                      event={item}
                      author={members.find((m) => m.id === item.authorId)}
                      onOpen={() =>
                        onEditEvent(item, fromKey(item.instanceDate))
                      }
                    />
                  ),
                )}
                {hiddenCount > 0 && (
                  <span className="px-1 text-[11px] text-muted-foreground">
                    +{hiddenCount} mais
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

interface EventChipProps {
  event: DayEvent
  author?: Member
  onOpen: () => void
}

/** Chip de evento do casal dentro de uma célula do grid. */
function EventChip({ event, author, onOpen }: EventChipProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
      title={`${event.title}${author ? ` · ${author.name}` : ""}`}
      className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] leading-tight transition-colors hover:brightness-95"
      style={{
        backgroundColor:
          "color-mix(in oklab, var(--primary) 8%, transparent)",
      }}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${CATEGORIES[event.category].dot}`}
      />
      <span className="truncate font-medium text-foreground/90">
        {event.title}
      </span>
      {event.startTime && (
        <span className="shrink-0 tabular-nums text-foreground/60">
          {formatTime(event.startTime)}
        </span>
      )}
      {event.repeat === "weekly" && (
        <Repeat
          className="size-2.5 shrink-0 text-foreground/40"
          aria-label="Semanal"
        />
      )}
      {event.accepted && (
        <Check className="size-3 shrink-0 text-emerald-500" aria-label="Aceito" />
      )}
      {author && (
        <span className="ml-auto shrink-0">
          <MemberAvatar member={author} className="size-3.5 text-[7px]" />
        </span>
      )}
    </button>
  )
}

interface ActivityChipProps {
  activity: DayActivity
  owner?: Member
  onOpen: () => void
}

/** Chip de atividade/ocupação dentro de uma célula do grid (listrado). */
function ActivityChip({ activity, owner, onOpen }: ActivityChipProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
      title={`${activity.title}${owner ? ` · ${owner.name}` : ""}`}
      className="flex items-center gap-1 truncate rounded border border-dashed border-border px-1 py-0.5 text-left text-[11px] leading-tight transition-colors hover:brightness-95"
      style={{
        backgroundColor:
          "repeating-linear-gradient(45deg, color-mix(in oklab, var(--muted) 55%, transparent) 0 3px, transparent 3px 6px)",
      }}
    >
      <span className="shrink-0 text-foreground/50" aria-hidden>
        <ActivityIcon category={activity.category} />
      </span>
      <span className="truncate font-medium text-foreground/90">
        {activity.title}
      </span>
      {activity.startTime && (
        <span className="shrink-0 tabular-nums text-foreground/60">
          {formatTime(activity.startTime)}
        </span>
      )}
      {owner && (
        <span className="ml-auto shrink-0">
          <MemberAvatar member={owner} className="size-3.5 text-[7px]" />
        </span>
      )}
    </button>
  )
}

function ActivityIcon({ category }: { category: string }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    romance: Heart,
    aniversario: Cake,
    viagem: Plane,
    compromisso: CalendarClock,
    saude: HeartPulse,
    outro: CircleDot,
  }
  const Icon = icons[category] ?? CircleDot
  return <Icon className="size-2.5 shrink-0" />
}
