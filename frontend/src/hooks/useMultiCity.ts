import { useQuery } from "@tanstack/react-query"
import { getMultiCity } from "@/api"

export function useMultiCity() {
  return useQuery({
    queryKey: ["multi-city"],
    queryFn: getMultiCity,
  })
}
