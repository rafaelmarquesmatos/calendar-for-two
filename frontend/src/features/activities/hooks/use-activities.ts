import { useCallback, useEffect, useState } from "react"
import type { Activity, ActivityInput } from "../types"
import { loadActivities, saveActivities } from "../lib/activities-store"

/**
 * Estado global (por enquanto local ao hook) das atividades do casal,
 * com persistência automática em localStorage.
 *
 * @param initial atividades já carregadas (pode vir da migração).
 */
export function useActivities(initial: Activity[] = loadActivities()) {
  const [activities, setActivities] = useState<Activity[]>(initial)

  useEffect(() => {
    saveActivities(activities)
  }, [activities])

  const addActivity = useCallback((input: ActivityInput): Activity => {
    const activity: Activity = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setActivities((prev) => [...prev, activity])
    return activity
  }, [])

  const updateActivity = useCallback(
    (id: string, patch: Partial<ActivityInput>): void => {
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === id ? { ...activity, ...patch } : activity,
        ),
      )
    },
    [],
  )

  const deleteActivity = useCallback((id: string): void => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id))
  }, [])

  return { activities, addActivity, updateActivity, deleteActivity }
}
