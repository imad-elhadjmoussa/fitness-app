import { useQuery } from "@tanstack/react-query"
import { getActivities } from "@/api"

export function useActivities(userId: string, limit = 20) {
  return useQuery({
    queryKey: ["activities", userId, limit],
    queryFn: () => getActivities(userId, limit),
    enabled: Boolean(userId),
  })
}
