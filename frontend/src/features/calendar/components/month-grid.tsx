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
import type { CalendarEvent, DayEvent } from "../types"

const MAX_VISIBLE_EVENTS = 2

interface MonthGridProps {
  currentMonth: Date
  selectedDate: Date
  /** Ocorrências expandidas do mês (inclui recorrentes semanais). */
  instances: DayEvent[]
  members: Member[]
  onSelectDate: (date: Date) => void
  onNavigate: (direction: -1 | 1) => void
  onGoToToday: () => void
  onNewEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent, date: Date) => void
}

export function MonthGrid({
  currentMonth,
  selectedDate,
  instances,
  members,
  onSelectDate,
  onNavigate,
  onGoToToday,
  onNewEvent,
  onEditEvent,
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
          const dayEvents = dayInstances(instances, day)
          const visible = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
          const hiddenCount = dayEvents.length - visible.length
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
                {visible.map((instance) => (
                  <EventChip
                    key={instance.instanceKey}
                    instance={instance}
                    author={members.find((m) => m.id === instance.authorId)}
                    onOpen={() =>
                      onEditEvent(instance, fromKey(instance.instanceDate))
                    }
                  />
                ))}
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
  instance: DayEvent
  author?: Member
  onOpen: () => void
}

/** Chip de evento dentro de uma célula do grid. */
function EventChip({ instance, author, onOpen }: EventChipProps) {
  const isPersonal = instance.type === "personal"
  const accepted = instance.accepted

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
      title={`${instance.title}${author ? ` · ${author.name}` : ""}`}
      className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] leading-tight transition-colors hover:brightness-95 ${
        isPersonal ? "border border-dashed border-border" : ""
      }`}
      style={{
        backgroundColor: isPersonal
          ? "repeating-linear-gradient(45deg, color-mix(in oklab, var(--muted) 55%, transparent) 0 3px, transparent 3px 6px)"
          : "color-mix(in oklab, var(--primary) 8%, transparent)",
      }}
    >
      {isPersonal ? (
        <span className="shrink-0 text-foreground/50" aria-hidden>
          <PersonalIcon category={instance.category} />
        </span>
      ) : (
        <span
          className={`size-1.5 shrink-0 rounded-full ${CATEGORIES[instance.category].dot}`}
        />
      )}
      <span className="truncate font-medium text-foreground/90">
        {instance.title}
      </span>
      {instance.startTime && (
        <span className="shrink-0 tabular-nums text-foreground/60">
          {formatTime(instance.startTime)}
        </span>
      )}
      {instance.repeat === "weekly" && (
        <Repeat className="size-2.5 shrink-0 text-foreground/40" aria-label="Semanal" />
      )}
      {accepted && (
        <Check
          className="size-3 shrink-0 text-emerald-500"
          aria-label="Aceito"
        />
      )}
      {author && (
        <span className="ml-auto shrink-0">
          <MemberAvatar member={author} className="size-3.5 text-[7px]" />
        </span>
      )}
    </button>
  )
}

function PersonalIcon({ category }: { category: string }) {
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
