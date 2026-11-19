import { useEffect, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { useUsers } from "@/hooks/useUsers"
import { useUpdateUser } from "@/hooks/useUpdateUser"
import { DataState } from "@/components/DataState"
import { ATHLETE_USER_ID } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

const GOALS = ["Marathon prep", "Lose weight", "Build muscle", "Stay active"]

export function ProfilePage() {
  const userId = ATHLETE_USER_ID
  const { data, isLoading, isError, error, refetch } = useUsers()
  const update = useUpdateUser()

  const user = useMemo(
    () => data?.find((u) => u._id === userId),
    [data, userId]
  )

  const [goal, setGoal] = useState("")
  const [weightKg, setWeightKg] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (!user) return
    setGoal(user.goal)
    setWeightKg(String(user.weightKg))
    setEmail(user.contact.email)
    setPhone(user.contact.phone)
  }, [user])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    const patch: {
      goal?: string
      weightKg?: number
      contact?: { email?: string; phone?: string }
    } = {}

    if (goal !== user.goal) patch.goal = goal

    const nextWeight = Number(weightKg)
    if (!Number.isNaN(nextWeight) && nextWeight !== user.weightKg) {
      patch.weightKg = nextWeight
    }

    const contact: { email?: string; phone?: string } = {}
    if (email !== user.contact.email) contact.email = email
    if (phone !== user.contact.phone) contact.phone = phone
    if (Object.keys(contact).length) patch.contact = contact

    if (!Object.keys(patch).length) {
      toast.message("No changes to save")
      return
    }

    update.mutate(
      { id: userId, patch },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Update failed"),
      }
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update goal, weight and contact. Only changed fields are sent.
        </p>
      </div>

      <DataState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!user}
        emptyMessage="User not found."
        loadingFallback={<Skeleton className="h-80 w-full max-w-lg" />}
      >
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{user?.name ?? "Profile"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <Select value={goal} onValueChange={(v) => v && setGoal(v)}>
                  <SelectTrigger id="goal" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min={30}
                  max={200}
                  step={0.1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DataState>
    </div>
  )
}
