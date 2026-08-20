# Separação Eventos × Atividades — Implementation Plan

> **Para Hermes:** implementar task a task com commits frequentes e verificação (`npm run build` + smoke tests node) ao fim de cada task que mexe em lógica.

**Goal:** Separar conceitualmente "Eventos" (planos do casal: jantar, viagem, aniversário — com aceite) de "Atividades" (rotinas pessoais de ocupação: trabalho, academia — grade semanal, sem aceite), porque trabalho não é um evento.

**Architecture:** O modelo atual tem um único `CalendarEvent` com `type: "shared" | "personal"` — mistura os conceitos e força atividades a terem "data base + recorrência semanal". A separação cria uma feature nova `activities/` com entidade própria (`Activity`), definida por **dias da semana + horário** (grade semanal, sem data de início). Eventos mantêm `date` + `repeat` opcional. A página do calendário compõe os dois no grid. Migração automática: eventos `personal` existentes viram `Activity` na primeira carga.

**Tech Stack:** React 19, TypeScript strict, Vite 8, Tailwind v4, shadcn/ui (radix-nova), date-fns, localStorage. Sem backend (mantém como está).

---

## Contexto atual (arquivos que mudam)

```
frontend/src/features/
├── calendar/
│   ├── types.ts                      # CalendarEvent com type "shared"|"personal", repeat
│   ├── lib/events-store.ts           # loadEvents (normaliza) / saveEvents
│   ├── lib/calendar-utils.ts         # expandEventsForMonth, nextInstances, dayInstances...
│   ├── lib/categories.ts             # CATEGORIES, CATEGORY_ORDER (vai sair daqui)
│   ├── hooks/use-events.ts           # CRUD + toggleAccept
│   ├── components/month-grid.tsx     # EventChip com isPersonal/listrado
│   ├── components/event-list.tsx     # DayEventCard com isPersonal/aceite
│   ├── components/event-dialog.tsx   # RadioGroup tipo (shared/personal) + select "Quem"
│   └── pages/calendar-page.tsx       # expandEventsForMonth + wiring
└── couple/                           # membros (não muda)
```

## Modelo de dados novo

```ts
// features/calendar/types.ts (simplificado — sem EventType, sem "personal")
export type EventCategory =
  | "romance" | "aniversario" | "viagem" | "compromisso" | "saude" | "outro"

export type RepeatRule = "none" | "weekly"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string            // YYYY-MM-DD
  startTime?: string      // HH:mm
  endTime?: string
  category: EventCategory
  authorId: string        // quem marcou
  accepted?: boolean      // aceite do parceiro
  acceptedAt?: string
  repeat: RepeatRule
  createdAt: string
}
export type EventInput = Omit<CalendarEvent, "id" | "createdAt">
export interface DayEvent extends CalendarEvent { instanceKey: string; instanceDate: string }

// features/activities/types.ts (NOVO)
export interface Activity {
  id: string
  title: string          // ex.: "Trabalho"
  description?: string
  weekdays: number[]     // dias da semana, convenção JS: 0=domingo..6=sábado
  startTime?: string     // ex.: "08:40"
  endTime?: string       // ex.: "17:00"
  category: EventCategory
  ownerId: string        // dono (member id)
  createdAt: string
}
export type ActivityInput = Omit<Activity, "id" | "createdAt">
export interface DayActivity extends Activity { instanceKey: string; instanceDate: string }
```

Decisão de nomenclatura: **"Atividade"** na UI (alternativas: "Rotina", "Ocupação" — renomear depois é só trocar strings, ver Open Questions).

`EventCategory` e `CATEGORIES` **sobem para `src/lib/categories.ts`** (regra do AGENTS.md: só sobe o que é compartilhado entre features — calendar e activities usam).

---

## Tasks

### Task 1: Mover categorias para `src/lib/categories.ts`

**Objective:** `EventCategory`, `CATEGORIES` e `CATEGORY_ORDER` viram compartilhadas.

**Files:**
- Create: `frontend/src/lib/categories.ts` (conteúdo atual de `features/calendar/lib/categories.ts`, com import de tipo local)
- Delete: `frontend/src/features/calendar/lib/categories.ts`
- Modify: imports em `month-grid.tsx`, `event-list.tsx`, `event-dialog.tsx` → `@/lib/categories`

**Step 1:** Criar `src/lib/categories.ts` com o conteúdo atual (mesmas classes Tailwind fixas + dark).
**Step 2:** Atualizar os 3 imports (`"../lib/categories"` → `"@/lib/categories"`) e deletar o arquivo antigo.
**Step 3:** Verificar: `cd frontend && npm run build` — esperado: build OK.
**Step 4:** Commit `refactor: move categories to shared lib`.

---

### Task 2: Simplificar `features/calendar/types.ts`

**Objective:** Remover `EventType` e o conceito "personal" dos tipos de evento.

**Files:**
- Modify: `frontend/src/features/calendar/types.ts`

**Step 1:** Remover `EventType`, o campo `type` de `CalendarEvent` (e de `EventInput`), e o comentário sobre shared/personal.
**Step 2:** Manter `DayEvent`, `RepeatRule`, `EventCategory` reexportado de `@/lib/categories` (ou import direto nos consumers — preferir import direto).
**Step 3:** Verificar: `npm run build` — esperado: erros de tipo nos arquivos que ainda usam `type` (Task 3+ corrige); **não commitar quebrado — rodar build e anotar os arquivos que apontam**.

---

### Task 3: Criar feature `activities/` (types + store + migração)

**Objective:** Entidade `Activity` com persistência própria e migração automática dos eventos `personal` antigos.

**Files:**
- Create: `frontend/src/features/activities/types.ts` (modelo acima)
- Create: `frontend/src/features/activities/lib/activities-store.ts`

**Step 1:** Criar `types.ts` (código acima).

**Step 2:** Criar `activities-store.ts`:

```ts
// frontend/src/features/activities/lib/activities-store.ts
import type { Activity } from "../types"
import type { CalendarEvent } from "@/features/calendar/types"

const ACTIVITIES_KEY = "calendar-for-two:activities"
const EVENTS_KEY = "calendar-for-two:events"
const MIGRATION_KEY = "calendar-for-two:migrated:activities-v1"

export function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Activity[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveActivities(activities: Activity[]): void {
  try { localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities)) } catch {}
}

/** Uma vez: converte eventos antigos type==="personal" em atividades. */
export function migratePersonalEvents(): Activity[] {
  if (localStorage.getItem(MIGRATION_KEY)) return loadActivities()
  let raw: string | null = null
  try { raw = localStorage.getItem(EVENTS_KEY) } catch {}
  if (!raw) { localStorage.setItem(MIGRATION_KEY, "1"); return [] }

  const events = JSON.parse(raw) as CalendarEvent[]
  const personal = events.filter((e) => e.type === "personal")
  const activities: Activity[] = personal.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    weekdays: [new Date(`${e.date}T00:00:00`).getDay()],
    startTime: e.startTime,
    endTime: e.endTime,
    category: e.category,
    ownerId: e.authorId,
    createdAt: e.createdAt,
  }))

  const remaining = events
    .filter((e) => e.type !== "personal")
    .map(({ type: _type, ...rest }) => rest)  // remove o campo type
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(remaining))
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities))
    localStorage.setItem(MIGRATION_KEY, "1")
  } catch {}
  return activities
}
```

**Step 3:** Smoke test (node, tipo dos anteriores):

```bash
cd frontend && node --input-type=module -e "
globalThis.localStorage = {
  _s: { 'calendar-for-two:events': JSON.stringify([
    { id:'e1', title:'Jantar', date:'2026-08-20', category:'romance', type:'shared', authorId:'m1', repeat:'none', createdAt:'' },
    { id:'e2', title:'Trabalho', date:'2026-08-10', startTime:'08:40', endTime:'17:00', category:'compromisso', type:'personal', authorId:'m1', repeat:'weekly', createdAt:'' }
  ]) },
  getItem(k){ return this._s[k] ?? null },
  setItem(k,v){ this._s[k]=v }
}
const { migratePersonalEvents } = await import('./src/features/activities/lib/activities-store.ts')
const acts = migratePersonalEvents()
console.log('atividades:', JSON.stringify(acts.map(a => ({t:a.title, wd:a.weekdays, from:a.startTime, to:a.endTime}))))
console.log('eventos restantes:', JSON.stringify(JSON.parse(globalThis.localStorage._s['calendar-for-two:events']).map(e=>e.id)))
console.log('type removido:', !('type' in JSON.parse(globalThis.localStorage._s['calendar-for-two:events'])[0]))
"
```

Esperado: `atividades: [{"t":"Trabalho","wd":[1],"from":"08:40","to":"17:00"}]` (10/08/2026 é segunda = getDay 1), `eventos restantes: ["e1"]`, `type removido: true`.

**Step 4:** Commit `feat: activities entity + migration from personal events`.

---

### Task 4: `use-activities` hook

**Objective:** CRUD de atividades com persistência automática.

**Files:**
- Create: `frontend/src/features/activities/hooks/use-activities.ts`

**Step 1:**

```ts
import { useCallback, useEffect, useState } from "react"
import type { Activity, ActivityInput } from "../types"
import { loadActivities, saveActivities } from "../lib/activities-store"

export function useActivities(initial: Activity[] = loadActivities()) {
  const [activities, setActivities] = useState<Activity[]>(initial)
  useEffect(() => { saveActivities(activities) }, [activities])

  const addActivity = useCallback((input: ActivityInput): Activity => {
    const activity: Activity = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setActivities((prev) => [...prev, activity])
    return activity
  }, [])
  const updateActivity = useCallback((id: string, patch: Partial<ActivityInput>) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])
  const deleteActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { activities, addActivity, updateActivity, deleteActivity }
}
```

**Step 2:** Commit `feat: use-activities hook`.

---

### Task 5: Expansão semanal de atividades

**Objective:** Gerar ocorrências por `weekdays` dentro do mês exibido (sem data base).

**Files:**
- Create: `frontend/src/features/activities/lib/activity-utils.ts`

**Step 1:**

```ts
import { addDays, startOfWeek } from "date-fns"
import { toDateKey } from "@/features/calendar/lib/calendar-utils"
import type { Activity, DayActivity } from "../types"

export const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

export function expandActivitiesForMonth(activities: Activity[], month: Date): DayActivity[] {
  const start = startOfWeek(month, { weekStartsOn: 1 })
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const result: DayActivity[] = []
  for (const activity of activities) {
    for (const day of days) {
      if (activity.weekdays.includes(day.getDay())) {
        const dayKey = toDateKey(day)
        result.push({ ...activity, instanceKey: `${activity.id}:${dayKey}`, instanceDate: dayKey })
      }
    }
  }
  return result
}

export function dayActivities(instances: DayActivity[], day: Date): DayActivity[] {
  const key = toDateKey(day)
  return instances
    .filter((i) => i.instanceDate === key)
    .sort((a, b) => (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99"))
}
```

**Step 2:** Smoke test — trabalho em seg/qua deve gerar ocorrências em todos os dias correspondentes de agosto/2026 (segundas 3,10,17,24,31 e quartas 5,12,19,26), e nada em 01/08 (sábado).

**Step 3:** Commit `feat: expand weekly activities for month grid`.

---

### Task 6: Atualizar `events-store.ts` (remover normalização de "personal")

**Objective:** `loadEvents` para de produzir/esperar eventos `personal`.

**Files:**
- Modify: `frontend/src/features/calendar/lib/events-store.ts`

**Step 1:** Remover o campo `type` da normalização e do retorno; `loadEvents` continua com fallback de `authorId` e defaults `repeat: "none"`. Eventos `personal` remanescentes (se a migração não rodou) devem ser **filtrados** (a migração da Task 3 é o caminho canônico).
**Step 2:** Commit `refactor: events-store drops personal type`.

---

### Task 7: Diálogo de atividade (`ActivityDialog`)

**Objective:** Criar/editar atividade: título, dias da semana, horários, categoria, descrição. Dono = perfil ativo (sem seletor).

**Files:**
- Run: `npx shadcn@latest add checkbox -y` (novo componente de UI)
- Create: `frontend/src/features/activities/components/activity-dialog.tsx`

**Step 1:** Adicionar o checkbox do shadcn.

**Step 2:** Criar o dialog (mesmo padrão do `EventDialog`):

- Campos: título (input, required), dias da semana (7 checkboxes `WEEKDAYS_SHORT` de `activity-utils`, com `0`=domingo mapeado para exibir "dom" por último na ordem seg→sáb→dom), início/término (time), categoria (select `CATEGORIES`), descrição (textarea).
- Estado: `weekdays: number[]` com toggle; `activeMember` passado por prop → `ownerId`.
- Ao salvar: `weekdays` vazio → bloquear submit (validação: "Selecione ao menos um dia").
- Rodapé igual ao EventDialog (excluir no modo edição; mostrar "Dono: [nome]" com avatar).

**Step 3:** Build + lint.
**Step 4:** Commit `feat: activity dialog`.

---

### Task 8: Grid do mês com os dois tipos de chip

**Objective:** `MonthGrid` renderiza eventos e atividades; atividades usam o visual listrado atual (ícone da categoria + avatar do dono + horário).

**Files:**
- Modify: `frontend/src/features/calendar/components/month-grid.tsx`

**Step 1:** Novas props: `activityInstances: DayActivity[]` e `members` (já existe).
**Step 2:** Renomear o chip atual para `EventChip` (sem o ramo `isPersonal` — eventos nunca mais são listrados). Criar `ActivityChip` com o estilo listrado/ícone/`Repeat` não aplicável; avatar do **dono**.
**Step 3:** Ordenação por dia: intercalar eventos e atividades por hora (`dayInstances` + `dayActivities` → merge sort por `startTime`).
**Step 4:** Limite visível: manter `MAX_VISIBLE_EVENTS = 2` sobre o merge.
**Step 5:** Commit `feat: month grid renders activities`.

---

### Task 9: Lista lateral (`EventList`) com atividades do dia

**Objective:** Dia selecionado mostra eventos + atividades (cards listrados, sem aceite); "Próximos" mostra **só eventos** (atividades são perpétuas).

**Files:**
- Modify: `frontend/src/features/calendar/components/event-list.tsx`

**Step 1:** Novas props: `activityInstances: DayActivity[]`, `activities: Activity[]` (para edição), `onEditActivity(activity)`, `onNewActivity(date)`.
**Step 2:** Seção "Eventos do dia": merge eventos + `dayActivities` ordenado por hora; card de atividade = visual listrado, avatar do dono, "ocupação" (sem `AcceptButton`).
**Step 3:** Seção nova **"Atividades"** entre o dia e os próximos: lista todas as atividades (título, dias abreviados, horário, avatar do dono) + botão "+" (abre `ActivityDialog`); clique edita; sem ScrollArea se curta.
**Step 4:** "Próximos eventos": `nextInstances(events, ...)` — inalterado (já só recebe eventos).
**Step 5:** Commit `feat: event list shows activities + management section`.

---

### Task 10: `EventDialog` sem tipo

**Objective:** Remover RadioGroup shared/personal e select "Quem" do dialog de evento (não fazem mais sentido).

**Files:**
- Modify: `frontend/src/features/calendar/components/event-dialog.tsx`

**Step 1:** Remover estado `type`/`authorId`, RadioGroup, e o select "Quem está ocupado". `authorId` na criação = `activeMember.id` (prop existente).
**Step 2:** Manter `repeat` (eventos ainda podem repetir semanalmente), aceite exibido como hoje.
**Step 3:** Commit `refactor: event dialog drops personal type`.

---

### Task 11: `CalendarPage` — wiring final + migração na inicialização

**Objective:** Página orquestra eventos + atividades, roda a migração uma vez, e adiciona o painel de atividades.

**Files:**
- Modify: `frontend/src/features/calendar/pages/calendar-page.tsx`

**Step 1:** `const migrated = useMemo(() => migratePersonalEvents(), [])` — rodar **antes** dos hooks de estado (migração síncrona no primeiro render). Passar `migrated` para `useActivities(migrated)`.
**Step 2:** `const activityInstances = expandActivitiesForMonth(activities, currentMonth)`; passar ao `MonthGrid` e ao `EventList`.
**Step 3:** Estado do dialog de atividade (`activityDialogOpen`, `editingActivity`); handlers `openNewActivity`/`openEditActivity`/`saveActivity`/`deleteActivity`.
**Step 4:** Commit `feat: wire activities into calendar page`.

---

### Task 12: Verificação final + smoke tests

**Objective:** Provar que nada quebrou.

**Files:**
- Run: verificação apenas

**Step 1:** `cd frontend && npm run build` — esperado: build OK.
**Step 2:** `npm run lint` — esperado: sem erros (warnings benignos aceitos).
**Step 3:** Smoke test node: (a) migração (Task 3), (b) expansão semanal com weekdays `[1,3]` gerando seg+qua, (c) `dayActivities` filtrando o dia certo, (d) eventos antigos shared continuam eventos com autor/aceite.
**Step 4:** Teste manual recomendado ao usuário: criar atividade "Trabalho seg/qua 08:40–17:00" → aparece listrada nos dias certos; criar evento "Jantar" → aceite funciona; trocar perfil no seletor → dono/aceite consistentes.
**Step 5:** Commit final se houver ajustes.

---

## Riscos e tradeoffs

- **Migração de dados:** se o usuário já criou eventos `personal` (ex.: trabalho), eles viram atividades na primeira carga — irreversível após o flag (backup simples: chave antiga permanece no storage até overwrite; mitigação aceitável para MVP).
- **Atividades perpétuas:** sem data de início/fim — uma atividade vale para sempre. Se o usuário precisar de "até dezembro", vira `endDate` opcional na lapidação.
- **Convenção de dia da semana:** `getDay()` (0=domingo) vs UI seg→dom — risco de off-by-one; centralizar em `WEEKDAYS_SHORT` e no teste da Task 5.
- **Nome "Atividade"** pode não agradar — é string de UI, renomear é trivial.
- **Sem test framework:** smoke tests via node (padrão da sessão). Recomendo adotar Vitest na lapidação (roadmap).
- **Chunk > 500 kB** no build: warning pré-existente, não relacionado.

## Open questions

1. Nome final na UI: "Atividades" vs "Rotinas" vs "Ocupações"?
2. Atividade precisa de `endDate` (válida até X) ou toggle "ativa/pausada" no MVP? (YAGNI: não, salvo se você disser que sim)
3. Aceite em atividades: confirmo que **não** terá (são ocupação pessoal, não plano)?
4. Painel "Atividades" mostra as do casal inteiro ou só as do perfil ativo?

## Verificação final do MVP

1. `npm run build` limpo.
2. Smoke tests passando (migração + expansão + merge do dia).
3. Fluxo manual: atividade semanal aparece nos dias certos; evento com aceite; seletor de perfil reflete donos corretos.
4. Commit final e push para `main`.
