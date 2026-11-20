import { Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import { useRole } from "@/context/RoleContext"
import { defaultPathForRole } from "@/lib/roles"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { TimelinePage } from "@/pages/athlete/TimelinePage"
import { CaloriesPage } from "@/pages/athlete/CaloriesPage"
import { StreakPage } from "@/pages/athlete/StreakPage"
import { ProfilePage } from "@/pages/athlete/ProfilePage"
import { CreateWorkoutPage } from "@/pages/athlete/CreateWorkoutPage"
import { ClientsPage } from "@/pages/coach/ClientsPage"
import { EngagementPage } from "@/pages/analyst/EngagementPage"
import { MultiCityPage } from "@/pages/analyst/MultiCityPage"
import { SchemaVarietyPage } from "@/pages/analyst/SchemaVarietyPage"
import { JobsPage } from "@/pages/analyst/JobsPage"

function HomeRedirect() {
  const { role } = useRole()
  return <Navigate to={defaultPathForRole(role)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="workouts/new" element={<CreateWorkoutPage />} />
        <Route path="calories" element={<CaloriesPage />} />
        <Route path="streak" element={<StreakPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="engagement" element={<EngagementPage />} />
        <Route path="multi-city" element={<MultiCityPage />} />
        <Route path="schema-variety" element={<SchemaVarietyPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="*" element={<HomeRedirect />} />
      </Route>
    </Routes>
  )
}
