import { useState } from "react"
import { addMonths, isSameMonth, startOfMonth } from "date-fns"
import { CalendarHeart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { EventDialog } from "../components/event-dialog"
import { EventList } from "../components/event-list"
import { MonthGrid } from "../components/month-grid"
import { useEvents } from "../hooks/use-events"
import type { CalendarEvent, EventInput } from "../types"

export function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents()

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [dialogDate, setDialogDate] = useState(() => new Date())

  const openNewEvent = (date: Date) => {
    setEditingEvent(null)
    setDialogDate(date)
    setDialogOpen(true)
  }

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setDialogDate(new Date(`${event.date}T00:00:00`))
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingEvent(null)
  }

  const handleSave = (input: EventInput) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, input)
    } else {
      const created = addEvent(input)
      // seleciona o dia do evento criado e navega até o mês dele
      const eventDate = new Date(`${created.date}T00:00:00`)
      setSelectedDate(eventDate)
      if (!isSameMonth(eventDate, currentMonth)) {
        setCurrentMonth(startOfMonth(eventDate))
      }
    }
  }

  const handleDelete = (id: string) => {
    deleteEvent(id)
    closeDialog()
  }

  const handleNavigate = (direction: -1 | 1) => {
    setCurrentMonth((month) => addMonths(month, direction))
  }

  const handleGoToToday = () => {
    const today = new Date()
    setCurrentMonth(startOfMonth(today))
    setSelectedDate(today)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex items-center gap-2">
        <CalendarHeart className="size-7 text-primary" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Calendar for Two
          </h1>
          <p className="text-sm text-muted-foreground">
            A agenda do casal, num lugar só.
          </p>
        </div>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="h-fit">
          <CardContent className="p-4 sm:p-6">
            <MonthGrid
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              events={events}
              onSelectDate={setSelectedDate}
              onNavigate={handleNavigate}
              onGoToToday={handleGoToToday}
              onNewEvent={openNewEvent}
              onEditEvent={openEditEvent}
            />
          </CardContent>
        </Card>

        <aside className="h-fit lg:sticky lg:top-8">
          <EventList
            selectedDate={selectedDate}
            events={events}
            onNewEvent={openNewEvent}
            onEditEvent={openEditEvent}
          />
        </aside>
      </div>

      <EventDialog
        open={dialogOpen}
        editingEvent={editingEvent}
        initialDate={dialogDate}
        onClose={closeDialog}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </main>
  )
}
