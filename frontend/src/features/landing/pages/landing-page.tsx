import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CalendarHeart } from "lucide-react"

export function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <CalendarHeart className="size-16 text-primary" aria-hidden />
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          Calendar for Two
        </h1>
        <p className="text-muted-foreground">
          O calendário compartilhado do casal — datas, planos e lembretes num
          só lugar.
        </p>
      </div>
      <Button asChild>
        <Link to="/calendar">Abrir calendário</Link>
      </Button>
    </main>
  )
}
