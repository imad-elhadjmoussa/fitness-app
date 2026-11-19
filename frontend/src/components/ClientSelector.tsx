import { useUsers } from "@/hooks/useUsers"
import { useRole } from "@/context/RoleContext"
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

  if (isLoading) return <Skeleton className="h-8 w-48" />

  const selected =
    users?.find((u) => u._id === currentUserId)?._id ?? users?.[0]?._id

  return (
    <Select
      value={selected}
      onValueChange={(value) => {
        if (value) setCurrentUserId(value)
      }}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select client" />
      </SelectTrigger>
      <SelectContent>
        {(users ?? []).map((u) => (
          <SelectItem key={u._id} value={u._id}>
            {u.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
