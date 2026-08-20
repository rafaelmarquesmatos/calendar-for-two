import { useMemo, useState } from "react"
import { addMonths, isSameMonth, startOfMonth } from "date-fns"
import { CalendarHeart, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberAvatar } from "@/features/couple/components/member-avatar"
import { SetupScreen } from "@/features/couple/components/setup-screen"
import { useMembers } from "@/features/couple/hooks/use-members"
import { ActivityDialog } from "@/features/activities/components/activity-dialog"
import { useActivities } from "@/features/activities/hooks/use-activities"
import { migratePersonalEvents } from "@/features/activities/lib/activities-store"
import { expandActivitiesForMonth } from "@/features/activities/lib/activity-utils"
import { EventDialog } from "../components/event-dialog"
import { EventList } from "../components/event-list"
import { MonthGrid } from "../components/month-grid"
import { useEvents } from "../hooks/use-events"
import { expandEventsForMonth } from "../lib/calendar-utils"
import type { Activity, ActivityInput } from "@/features/activities/types"
import type { CalendarEvent, EventInput } from "../types"

export function CalendarPage() {
  const { members, activeMember, setup, switchActiveMember } = useMembers()

  // Migração única: eventos "personal" de versões antigas viram atividades.
  // Roda antes do useActivities, que inicializa com o resultado.
  const migratedActivities = useMemo(() => migratePersonalEvents(), [])

  const { events, addEvent, updateEvent, deleteEvent, toggleAccept } =
    useEvents(activeMember?.id)
  const { activities, addActivity, updateActivity, deleteActivity } =
    useActivities(migratedActivities)

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [eventDialogDate, setEventDialogDate] = useState(() => new Date())

  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  // Primeira execução: apresentar o casal
  if (!activeMember || members.length < 2) {
    return <SetupScreen onComplete={setup} />
  }

  const instances = expandEventsForMonth(events, currentMonth)
  const activityInstances = expandActivitiesForMonth(activities, currentMonth)

  // --- Eventos ---
  const openNewEvent = (date: Date) => {
    setEditingEvent(null)
    setEventDialogDate(date)
    setEventDialogOpen(true)
  }

  const openEditEvent = (event: CalendarEvent, date: Date) => {
    setEditingEvent(event)
    setEventDialogDate(date)
    setEventDialogOpen(true)
  }

  const closeEventDialog = () => {
    setEventDialogOpen(false)
    setEditingEvent(null)
  }

  const handleSaveEvent = (input: EventInput) => {
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

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id)
    closeEventDialog()
  }

  // --- Atividades ---
  const openNewActivity = () => {
    setEditingActivity(null)
    setActivityDialogOpen(true)
  }

  const openEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setActivityDialogOpen(true)
  }

  const closeActivityDialog = () => {
    setActivityDialogOpen(false)
    setEditingActivity(null)
  }

  const handleSaveActivity = (input: ActivityInput) => {
    if (editingActivity) {
      updateActivity(editingActivity.id, input)
    } else {
      addActivity(input)
    }
  }

  const handleDeleteActivity = (id: string) => {
    deleteActivity(id)
    closeActivityDialog()
  }

  // --- Navegação ---
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
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarHeart className="size-7 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Calendar for Two
            </h1>
            <p className="text-sm text-muted-foreground">
              A agenda do casal, num lugar só.
            </p>
          </div>
        </div>

        {/* Seletor de perfil ativo */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <MemberAvatar member={activeMember} className="size-5 text-[9px]" />
              <span className="hidden sm:inline">
                Visualizando como {activeMember.name}
              </span>
              <span className="sm:hidden">{activeMember.name}</span>
              <ChevronDown className="size-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quem está usando?</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {members.map((member) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => switchActiveMember(member.id)}
                className="gap-2"
              >
                <MemberAvatar member={member} />
                {member.name}
                {member.id === activeMember.id ? " (atual)" : ""}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="h-fit">
          <CardContent className="p-4 sm:p-6">
            <MonthGrid
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              instances={instances}
              activityInstances={activityInstances}
              members={members}
              onSelectDate={setSelectedDate}
              onNavigate={handleNavigate}
              onGoToToday={handleGoToToday}
              onNewEvent={openNewEvent}
              onEditEvent={openEditEvent}
              onEditActivity={openEditActivity}
            />
          </CardContent>
        </Card>

        <aside className="h-fit lg:sticky lg:top-8">
          <EventList
            selectedDate={selectedDate}
            instances={instances}
            activityInstances={activityInstances}
            events={events}
            activities={activities}
            members={members}
            activeMember={activeMember}
            onNewEvent={openNewEvent}
            onEditEvent={openEditEvent}
            onNewActivity={openNewActivity}
            onEditActivity={openEditActivity}
            onToggleAccept={toggleAccept}
          />
        </aside>
      </div>

      <EventDialog
        open={eventDialogOpen}
        editingEvent={editingEvent}
        initialDate={eventDialogDate}
        members={members}
        activeMember={activeMember}
        onClose={closeEventDialog}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      <ActivityDialog
        open={activityDialogOpen}
        editingActivity={editingActivity}
        members={members}
        activeMember={activeMember}
        onClose={closeActivityDialog}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
      />
    </main>
  )
}
