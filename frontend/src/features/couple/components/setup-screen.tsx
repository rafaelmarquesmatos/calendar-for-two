import { useState } from "react"
import { HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SetupScreenProps {
  onComplete: (names: [string, string]) => void
}

/**
 * Primeira execução: define quem é o casal que usa este dispositivo.
 */
export function SetupScreen({ onComplete }: SetupScreenProps) {
  const [names, setNames] = useState<[string, string]>(["", ""])

  const canSubmit = names.every((n) => n.trim().length > 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canSubmit) onComplete(names)
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <HeartHandshake className="mx-auto size-10 text-primary" />
          <CardTitle className="text-2xl">Calendar for Two</CardTitle>
          <CardDescription>
            Quem usa este dispositivo? Apresente o casal para começar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name-me">Você</Label>
              <Input
                id="name-me"
                placeholder="Seu nome"
                value={names[0]}
                onChange={(e) => setNames([e.target.value, names[1]])}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name-partner">Sua parceira</Label>
              <Input
                id="name-partner"
                placeholder="Nome da parceira"
                value={names[1]}
                onChange={(e) => setNames([names[0], e.target.value])}
              />
            </div>
            <Button type="submit" disabled={!canSubmit}>
              Começar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
