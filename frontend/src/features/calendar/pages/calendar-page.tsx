import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Página do calendário compartilhado (placeholder).
 * A lógica de eventos virá na feature calendar (lib, hooks, components).
 */
export function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Calendário compartilhado
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Próximos planos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          <p className="text-sm text-muted-foreground">
            {date
              ? date.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Nenhuma data selecionada"}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
