import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { toDateKey } from "../lib/calendar-utils"
import type { Member } from "@/features/couple/types"
import type {
  CalendarEvent,
  EventCategory,
  EventInput,
  RepeatRule,
} from "../types"

interface EventDialogProps {
  open: boolean
  /** Evento em edição; null quando é criação. */
  editingEvent: CalendarEvent | null
  /** Data inicial (usada na criação ou na ocorrência em edição). */
  initialDate: Date
  members: Member[]
  activeMember: Member
  onClose: () => void
  onSave: (input: EventInput) => void
  onDelete: (id: string) => void
}

export function EventDialog({
  open,
  editingEvent,
  initialDate,
  members,
  activeMember,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<EventCategory>("romance")
  const [date, setDate] = useState(() => toDateKey(initialDate))
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [repeat, setRepeat] = useState<RepeatRule>("none")
  const [description, setDescription] = useState("")

  // Sincroniza o formulário com o evento em edição / data inicial
  useEffect(() => {
    if (!open) return
    setTitle(editingEvent?.title ?? "")
    setCategory(editingEvent?.category ?? "romance")
    setDate(editingEvent?.date ?? toDateKey(initialDate))
    setStartTime(editingEvent?.startTime ?? "")
    setEndTime(editingEvent?.endTime ?? "")
    setRepeat(editingEvent?.repeat ?? "none")
    setDescription(editingEvent?.description ?? "")
  }, [open, editingEvent, initialDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle || !date) return

    onSave({
      title: trimmedTitle,
      category,
      authorId: editingEvent?.authorId ?? activeMember.id,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      repeat,
      description: description.trim() || undefined,
      accepted: editingEvent?.accepted,
      acceptedAt: editingEvent?.acceptedAt,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Editar evento" : "Novo evento"}
          </DialogTitle>
          <DialogDescription>
            Um plano do casal: jantar, viagem, aniversário — o parceiro pode
            aceitar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="event-title">Título</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Jantar romântico"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="event-category">Categoria</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as EventCategory)}
              >
                <SelectTrigger id="event-category">
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
            <div className="grid gap-2">
              <Label htmlFor="event-date">Data</Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="event-start">Início</Label>
              <Input
                id="event-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-end">Término</Label>
              <Input
                id="event-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-repeat">Repetição</Label>
              <Select
                value={repeat}
                onValueChange={(v) => setRepeat(v as RepeatRule)}
              >
                <SelectTrigger id="event-repeat">
                  <SelectValue placeholder="Repetição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não repete</SelectItem>
                  <SelectItem value="weekly">Toda semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-description">Descrição</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes, endereço, o que levar..."
              rows={3}
            />
          </div>

          {editingEvent &&
            (() => {
              const author = members.find((m) => m.id === editingEvent.authorId)
              return (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {author && (
                    <MemberAvatar member={author} className="size-4 text-[8px]" />
                  )}
                  Marcado por {author?.name ?? "desconhecido"}
                  {editingEvent.accepted
                    ? " · aceito pelo parceiro"
                    : " · aguardando aceite"}
                </p>
              )
            })()}

          <DialogFooter className="gap-2 sm:justify-between">
            {editingEvent && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => onDelete(editingEvent.id)}
                aria-label="Excluir evento"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingEvent ? "Salvar" : "Criar evento"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
