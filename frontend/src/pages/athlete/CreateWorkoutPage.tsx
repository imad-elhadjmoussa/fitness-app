import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { useCreateWorkout } from "@/hooks/useCreateWorkout"
import { WORKOUT_TYPES } from "@/lib/roles"
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

export function CreateWorkoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const create = useCreateWorkout()

  const [workoutType, setWorkoutType] = useState<string>("running")
  const [duration, setDuration] = useState("45")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [city, setCity] = useState("")
  const [calories, setCalories] = useState("")
  const [device, setDevice] = useState("phone")
  const [model, setModel] = useState("")
  const [includeGps, setIncludeGps] = useState(false)
  const [includeHr, setIncludeHr] = useState(false)
  const [photoUrl, setPhotoUrl] = useState("")
  const [avgHr, setAvgHr] = useState("135")
  const [maxHr, setMaxHr] = useState("170")

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    const durationNum = Number(duration)
    if (!durationNum || durationNum <= 0) {
      toast.error("Duration must be a positive number (minutes)")
      return
    }

    create.mutate(
      {
        userId: user._id,
        workoutType,
        duration: durationNum,
        date: new Date(date).toISOString(),
        ...(city.trim() ? { city: city.trim() } : {}),
        ...(calories ? { calories: Number(calories) } : {}),
        deviceInfo: {
          device,
          ...(model.trim() ? { model: model.trim() } : {}),
        },
        ...(includeGps
          ? {
              gpsRoute: {
                distance: 5,
                unit: "km",
                startLocation: { latitude: 36.365, longitude: 6.614 },
                endLocation: { latitude: 36.37, longitude: 6.62 },
                coordinates: [
                  {
                    latitude: 36.365,
                    longitude: 6.614,
                    timestamp: new Date(date).toISOString(),
                  },
                  {
                    latitude: 36.37,
                    longitude: 6.62,
                    timestamp: new Date(date).toISOString(),
                  },
                ],
              },
            }
          : {}),
        ...(includeHr
          ? {
              heartRate: {
                average: Number(avgHr) || 130,
                maximum: Number(maxHr) || 160,
                measurements: [
                  { time: "00:00", bpm: 110 },
                  { time: "00:15", bpm: Number(avgHr) || 135 },
                  { time: "00:30", bpm: Number(maxHr) || 160 },
                ],
              },
            }
          : {}),
        ...(photoUrl.trim()
          ? { photos: [{ url: photoUrl.trim(), caption: workoutType }] }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success("Workout logged")
          navigate("/timeline")
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Could not save workout"),
      }
    )
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Athlete</p>
          <h1 className="page-title">Log workout</h1>
          <p className="page-subtitle">
            Capture a session with optional GPS, heart rate, or photos — schema stays flexible.
          </p>
        </div>
      </header>

      <Card className="surface-card max-w-2xl">
        <CardHeader>
          <CardTitle>New session</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={workoutType}
                onValueChange={(v) => v && setWorkoutType(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="date">Date & time</Label>
              <Input
                id="date"
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Constantine"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                min={0}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Input
                id="device"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="optional"
              />
            </div>

            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={includeGps}
                onChange={(e) => setIncludeGps(e.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
              Include sample GPS route
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={includeHr}
                onChange={(e) => setIncludeHr(e.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
              Include heart-rate series
            </label>

            {includeHr ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="avgHr">Avg BPM</Label>
                  <Input
                    id="avgHr"
                    type="number"
                    value={avgHr}
                    onChange={(e) => setAvgHr(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxHr">Max BPM</Label>
                  <Input
                    id="maxHr"
                    type="number"
                    value={maxHr}
                    onChange={(e) => setMaxHr(e.target.value)}
                  />
                </div>
              </>
            ) : null}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="photo">Photo URL (optional)</Label>
              <Input
                id="photo"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Saving…" : "Save workout"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/timeline")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
