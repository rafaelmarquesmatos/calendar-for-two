import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MemberAvatar } from "@/features/couple/components/member-avatar"
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories"
import { WEEKDAYS_ORDER, WEEKDAYS_SHORT } from "../lib/activity-utils"
import type { Member } from "@/features/couple/types"
import type { Activity, ActivityInput } from "../types"

interface ActivityDialogProps {
  open: boolean
  /** Atividade em edição; null quando é criação. */
  editingActivity: Activity | null
  members: Member[]
  activeMember: Member
  onClose: () => void
  onSave: (input: ActivityInput) => void
  onDelete: (id: string) => void
}

export function ActivityDialog({
  open,
  editingActivity,
  members,
  activeMember,
  onClose,
  onSave,
  onDelete,
}: ActivityDialogProps) {
  const [title, setTitle] = useState("")
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [category, setCategory] = useState<Activity["category"]>("compromisso")
  const [description, setDescription] = useState("")

  // Sincroniza o formulário com a atividade em edição
  useEffect(() => {
    if (!open) return
    setTitle(editingActivity?.title ?? "")
    setWeekdays(editingActivity?.weekdays ?? [])
    setStartTime(editingActivity?.startTime ?? "")
    setEndTime(editingActivity?.endTime ?? "")
    setCategory(editingActivity?.category ?? "compromisso")
    setDescription(editingActivity?.description ?? "")
  }, [open, editingActivity])

  const toggleWeekday = (day: number) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle || weekdays.length === 0) return

    onSave({
      title: trimmedTitle,
      weekdays: [...weekdays].sort((a, b) => a - b),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      category,
      description: description.trim() || undefined,
      ownerId: editingActivity?.ownerId ?? activeMember.id,
    })
    onClose()
  }

  const owner = members.find((m) => m.id === editingActivity?.ownerId)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingActivity ? "Editar atividade" : "Nova atividade"}
          </DialogTitle>
          <DialogDescription>
            Uma rotina pessoal de ocupação — ex.: trabalho, academia. Vale toda
            semana, nos dias marcados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="activity-title">Título</Label>
            <Input
              id="activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Trabalho"
              autoFocus
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Dias da semana</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS_ORDER.map((day) => (
                <label
                  key={day}
                  className={`flex cursor-pointer select-none items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${
                    weekdays.includes(day)
                      ? "border-primary bg-primary/10 font-medium"
                      : "hover:bg-muted/60"
                  }`}
                >
                  <Checkbox
                    checked={weekdays.includes(day)}
                    onCheckedChange={() => toggleWeekday(day)}
                    className="size-4"
                  />
                  {WEEKDAYS_SHORT[day]}
                </label>
              ))}
            </div>
            {weekdays.length === 0 && (
              <p className="text-xs text-destructive">
                Selecione ao menos um dia.
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="activity-start">Início</Label>
              <Input
                id="activity-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activity-end">Término</Label>
              <Input
                id="activity-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activity-category">Categoria</Label>
              <Select
                value={category}
                onValueChange={(v) =>
                  setCategory(v as Activity["category"])
                }
              >
                <SelectTrigger id="activity-category">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ORDER.map((key) => (
                    <SelectItem key={key} value={key}>
                      {CATEGORIES[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="activity-description">Descrição</Label>
            <Textarea
              id="activity-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes, local, observações..."
              rows={2}
            />
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            {owner ? (
              <>
                <MemberAvatar member={owner} className="size-4 text-[8px]" />
                Ocupação de {owner.name}
              </>
            ) : (
              <>Ocupação de {activeMember.name}</>
            )}
          </p>

          <DialogFooter className="gap-2 sm:justify-between">
            {editingActivity && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => onDelete(editingActivity.id)}
                aria-label="Excluir atividade"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={weekdays.length === 0}>
                {editingActivity ? "Salvar" : "Criar atividade"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
