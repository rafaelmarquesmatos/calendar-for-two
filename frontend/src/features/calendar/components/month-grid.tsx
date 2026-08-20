import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORIES } from "../lib/categories"
import {
  WEEKDAYS_SHORT,
  eventsForDay,
  formatMonthYear,
  formatTime,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  isToday,
  toDateKey,
} from "../lib/calendar-utils"
import type { CalendarEvent } from "../types"

const MAX_VISIBLE_EVENTS = 2

interface MonthGridProps {
  currentMonth: Date
  selectedDate: Date
  events: CalendarEvent[]
  onSelectDate: (date: Date) => void
  onNavigate: (direction: -1 | 1) => void
  onGoToToday: () => void
  onNewEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export function MonthGrid({
  currentMonth,
  selectedDate,
  events,
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
          const dayEvents = eventsForDay(events, day)
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
                {visible.map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditEvent(event)
                    }}
                    className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] leading-tight hover:brightness-95"
                    style={{ backgroundColor: "color-mix(in oklab, var(--primary) 8%, transparent)" }}
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
                  </button>
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
