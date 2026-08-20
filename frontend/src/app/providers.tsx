import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import type { ReactNode } from "react"

/**
 * Providers globais da aplicação.
 * Adicione aqui novos providers (tema, query, auth, etc.) conforme o app crescer.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster />
    </TooltipProvider>
  )
}
