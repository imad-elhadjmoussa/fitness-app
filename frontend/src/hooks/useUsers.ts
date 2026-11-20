import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/api"

export function useUsers(role?: string) {
  return useQuery({
    queryKey: ["users", role ?? "all"],
    queryFn: () => getUsers(role),
  })
}
