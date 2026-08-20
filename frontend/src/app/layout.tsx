import { Outlet } from "react-router-dom"

/**
 * Layout raiz: define o shell visual comum a todas as rotas
 * (fundo, navegação futura, etc.).
 */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Outlet />
    </div>
  )
}
