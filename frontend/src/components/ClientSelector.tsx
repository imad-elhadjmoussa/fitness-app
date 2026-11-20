import { useEffect } from "react"
import { useUsers } from "@/hooks/useUsers"
import { useRole } from "@/context/RoleContext"
import { displayName } from "@/lib/mappers"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export function ClientSelector() {
  const { data: users, isLoading } = useUsers()
  const { currentUserId, setCurrentUserId } = useRole()

  const athletes = (users ?? []).filter((u) => u.role === "athlete")

  useEffect(() => {
    if (!athletes.length) return
    if (!athletes.some((u) => u._id === currentUserId)) {
      setCurrentUserId(athletes[0]._id)
    }
  }, [athletes, currentUserId, setCurrentUserId])

  if (isLoading) return <Skeleton className="h-8 w-48" />

  return (
    <Select
      value={currentUserId || athletes[0]?._id}
      onValueChange={(value) => {
        if (value) setCurrentUserId(value)
      }}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select client" />
      </SelectTrigger>
      <SelectContent>
        {athletes.map((u) => (
          <SelectItem key={u._id} value={u._id}>
            {displayName(u)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
