import { useState } from "react"
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Activity, LogOut, Menu } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRole } from "@/context/RoleContext"
import { ThemeToggle } from "@/components/ThemeToggle"
import { isPathAllowed, ROLE_LABELS, ROLE_NAV } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "cn"

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { role } = useRole()
  const items = ROLE_NAV[role]

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn("nav-pill", isActive ? "nav-pill-active" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const { role, displayName } = useRole()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center gap-3 px-1">
        <div className="brand-mark">
          <Activity className="size-4" />
        </div>
        <div>
          <p className="font-display text-base font-semibold tracking-tight text-sidebar-foreground">
            FitPulse
          </p>
          <p className="text-xs text-sidebar-foreground/60">Performance OS</p>
        </div>
      </div>

      <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/40 px-3 py-3">
        <p className="text-xs text-sidebar-foreground/60">Signed in as</p>
        <p className="truncate text-sm font-medium text-sidebar-foreground">
          {displayName}
        </p>
        <p className="mt-0.5 text-xs text-sidebar-foreground/55">
          {ROLE_LABELS[role]}
        </p>
        <p className="mt-1 truncate text-[11px] text-sidebar-foreground/45">
          {user?.email}
        </p>
      </div>

      <SidebarNav onNavigate={onNavigate} />

      <div className="mt-auto space-y-3">
        <Separator className="bg-sidebar-border" />
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={() => {
            logout()
            navigate("/login")
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const { role } = useRole()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading session…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isPathAllowed(role, location.pathname)) {
    return <Navigate to={ROLE_NAV[role][0].to} replace />
  }

  const title =
    ROLE_NAV[role].find((i) => location.pathname.startsWith(i.to))?.label ??
    ROLE_LABELS[role]

  return (
    <div className="flex min-h-svh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-svh w-64 overflow-y-auto border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground md:block">
        <SidebarBody />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="md:hidden"
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold">{title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[role]} dashboard
            </p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
