# AGENTS.md — Calendar for Two

Calendário compartilhado para casais: os dois parceiros organizam datas,
planos e lembretes num único lugar.

## Stack (definida)

| Camada | Tecnologia |
|---|---|
| UI | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Estilo | Tailwind CSS v4 (tokens em `oklch`, CSS variables) |
| Componentes | shadcn/ui — estilo `radix-nova`, preset `nova`, ícones `lucide` |
| Roteamento | React Router (data router, `createBrowserRouter`) |
| Notificações | sonner (toasts) |

Backend ainda não existe — o projeto está **front-end only** por enquanto.
Quando surgir, ficará em `backend/` (monorepo).

## Estrutura

```
├── frontend/                  # aplicação front-end (única pasta ativa)
│   └── src/
│       ├── app/               # camada de aplicação: providers, router, layout
│       ├── components/
│       │   ├── ui/            # componentes shadcn/ui (GERADOS — não editar à mão)
│       │   └── shared/        # componentes próprios reutilizáveis
│       ├── features/          # módulos por funcionalidade (feature-based)
│       │   ├── calendar/      #   components/ hooks/ lib/ pages/ types
│       │   └── landing/
│       ├── hooks/             # hooks globais (fora de feature)
│       ├── lib/               # utils genéricos (cn, futuramente api client)
│       ├── types/             # tipos globais compartilhados
│       ├── main.tsx           # entrada (providers + router)
│       └── index.css          # tokens de tema (Tailwind v4 + shadcn)
├── AGENTS.md
└── README.md
```

## Regras da arquitetura

1. **Feature-based**: código de uma funcionalidade vive dentro de
   `src/features/<feature>/` (components, hooks, lib, pages, types próprios).
   Só sobe para `src/hooks` / `src/lib` / `src/types` o que for reutilizado
   por mais de uma feature.
2. **Camada `app/`**: apenas providers, rotas e layout raiz. Sem lógica de
   negócio aqui.
3. **Componentes shadcn/ui são gerados** em `components/ui/` pelo CLI
   (`npx shadcn add <nome>`). Não edite à mão — se precisar de variação,
   crie um componente em `components/shared/` que o envolva.
4. **Imports**: sempre pelo alias `@/` (ex.: `@/components/ui/button`),
   nunca caminhos relativos longos.
5. **Idioma**: UI em pt-BR; código (variáveis, comentários, commits) em
   português ou inglês — escolha um e mantenha consistência. Preferência:
   código em inglês, textos de UI em pt-BR.
6. **Tipos**: TypeScript strict. Nada de `any` silencioso. Tipos de domínio
   (Evento, Casal, etc.) em `types/` ou na feature correspondente.
7. **Rotas**: declaradas centralmente em `src/app/router.tsx`; cada feature
   exporta suas páginas de `features/<feature>/pages/`.

## Comandos

```bash
cd frontend

npm run dev          # dev server (http://localhost:5173)
npm run build        # tsc -b && vite build (valida tipos + bundle)
npm run preview      # serve o build de produção
npm run lint         # oxlint

# adicionar componente shadcn
npx shadcn add button card dialog
```

## Convenções de commit

- Mensagens curtas e descritivas, em inglês ou português.
- Um commit por mudança coesa (ex.: `feat: add calendar grid`, `chore: scaffold frontend`).
- Rodar `npm run build` antes de commitar (o CI não existe ainda — o build é a barreira).

## Roadmap (front-end)

- [x] Calendário mensal com eventos do casal
- [x] Criação/edição de eventos (dialog + formulário)
- [x] Identificação de autor (quem marcou) e perfis locais do casal (feature `couple`)
- [x] Aceite de eventos pelo parceiro (com seletor "visualizando como" para simular os dois lados)
- [x] Eventos pessoais de ocupação (ex.: trabalho) com recorrência semanal
- [x] Persistência local (localStorage — `lib/events-store.ts`; trocar por API quando houver backend)
- [ ] Lembretes e notificações
- [ ] Autenticação e vínculo do casal (quando houver backend)
- [ ] Perfil do casal (datas importantes: aniversários, etc.)
