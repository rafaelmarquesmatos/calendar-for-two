import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "@/app/layout"
import { LandingPage } from "@/features/landing/pages/landing-page"
import { CalendarPage } from "@/features/calendar/pages/calendar-page"

/**
 * Rotas da aplicação.
 * Regra: cada feature é dona das próprias páginas (features/<feature>/pages).
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/calendar", element: <CalendarPage /> },
    ],
  },
])
