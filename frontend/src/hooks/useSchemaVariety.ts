import { useQuery } from "@tanstack/react-query"
import { getSchemaVariety } from "@/api"

export function useSchemaVariety() {
  return useQuery({
    queryKey: ["schema-variety"],
    queryFn: getSchemaVariety,
  })
}
