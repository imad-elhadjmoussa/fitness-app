import { useQuery } from "@tanstack/react-query"
import { getCalories } from "@/api"

export function useCalories(userId: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ["calories", userId, from, to],
    queryFn: () => getCalories(userId, from, to),
    enabled: Boolean(userId),
  })
}
