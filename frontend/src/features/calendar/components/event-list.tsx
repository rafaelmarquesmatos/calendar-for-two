import { CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CATEGORIES } from "../lib/categories"
import {
  eventsForDay,
  formatDayHeader,
  formatTime,
  toDateKey,
} from "../lib/calendar-utils"
import type { CalendarEvent } from "../types"

interface EventListProps {
  selectedDate: Date
  events: CalendarEvent[]
  onNewEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export function EventList({
  selectedDate,
  events,
  onNewEvent,
  onEditEvent,
}: EventListProps) {
  const dayEvents = eventsForDay(events, selectedDate)
  const upcoming = events
    .filter((event) => event.date > toDateKey(selectedDate))
    .slice(0, 5)

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
            {dayEvents.map((event) => (
              <li key={event.id}>
                <button
                  onClick={() => onEditEvent(event)}
                  className="flex w-full items-start gap-2 rounded-md border bg-card p-3 text-left transition-colors hover:bg-muted/60"
                >
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${CATEGORIES[event.category].dot}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {event.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {CATEGORIES[event.category].label}
                      {event.description ? ` · ${event.description}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatTime(event.startTime)}
                  </span>
                </button>
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
              {upcoming.map((event) => (
                <li key={event.id}>
                  <button
                    onClick={() => onEditEvent(event)}
                    className="flex w-full items-start gap-2 rounded-md border bg-card p-3 text-left transition-colors hover:bg-muted/60"
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${CATEGORIES[event.category].dot}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {event.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {new Date(
                          `${event.date}T00:00:00`,
                        ).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatTime(event.startTime)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </section>
    </div>
  )
}
