import { useQuery } from "@tanstack/react-query"
import { getLeaderboard } from "@/api"

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  })
}
