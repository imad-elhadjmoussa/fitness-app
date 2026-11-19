import { useQuery } from "@tanstack/react-query"
import { getEngagement } from "@/api"

export function useEngagement() {
  return useQuery({
    queryKey: ["engagement"],
    queryFn: getEngagement,
  })
}
