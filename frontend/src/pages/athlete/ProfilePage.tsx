import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { useUpdateUser } from "@/hooks/useUpdateUser"
import { FITNESS_GOALS } from "@/lib/roles"
import { goalLabel } from "@/lib/mappers"
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

export function ProfilePage() {
  const { user } = useAuth()
  const update = useUpdateUser()

  const [fitnessGoal, setFitnessGoal] = useState("general_fitness")
  const [weight, setWeight] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  useEffect(() => {
    if (!user) return
    setFitnessGoal(user.profile?.fitnessGoal || "general_fitness")
    setWeight(
      user.profile?.weight !== undefined ? String(user.profile.weight) : ""
    )
    setPhone(user.profile?.contact?.phone || "")
    setAddress(user.profile?.contact?.address || "")
  }, [user])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    const patch: {
      fitnessGoal?: string
      weight?: number
      contact?: { phone?: string; address?: string }
    } = {}

    if (fitnessGoal !== (user.profile?.fitnessGoal || "general_fitness")) {
      patch.fitnessGoal = fitnessGoal
    }

    const nextWeight = Number(weight)
    if (
      weight !== "" &&
      !Number.isNaN(nextWeight) &&
      nextWeight !== user.profile?.weight
    ) {
      patch.weight = nextWeight
    }

    const contact: { phone?: string; address?: string } = {}
    if (phone !== (user.profile?.contact?.phone || "")) contact.phone = phone
    if (address !== (user.profile?.contact?.address || "")) {
      contact.address = address
    }
    if (Object.keys(contact).length) patch.contact = contact

    if (!Object.keys(patch).length) {
      toast.message("No changes to save")
      return
    }

    update.mutate(
      { id: user._id, patch },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Update failed"),
      }
    )
  }

  if (!user) return null

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">
            Update goal, weight and contact. Only changed fields are sent to the API.
          </p>
        </div>
      </header>

      <Card className="surface-card max-w-lg">
        <CardHeader>
          <CardTitle>
            {user.firstName} {user.lastName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            Current goal: {goalLabel(user.profile?.fitnessGoal)}
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label>Fitness goal</Label>
              <Select
                value={fitnessGoal}
                onValueChange={(v) => v && setFitnessGoal(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FITNESS_GOALS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
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
                min={1}
                step={0.1}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
