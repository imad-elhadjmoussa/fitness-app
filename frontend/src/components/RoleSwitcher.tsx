import { useRole } from "@/context/RoleContext"
import type { Role } from "@/types"
import { ROLE_LABELS } from "@/lib/roles"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ROLES: Role[] = ["athlete", "coach", "analyst"]

export function RoleSwitcher() {
  const { role, displayName, setRole } = useRole()

  return (
    <div className="space-y-2 px-1">
      <p className="text-xs font-medium text-muted-foreground">Role</p>
      <Select
        value={role}
        onValueChange={(value) => {
          if (value) setRole(value as Role)
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABELS[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Logged in as <span className="font-medium text-foreground">{displayName}</span>
      </p>
    </div>
  )
}
