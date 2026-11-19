import { useState } from "react"
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom"
import { Activity, Menu } from "lucide-react"
import { useRole } from "@/context/RoleContext"
import { RoleSwitcher } from "@/components/RoleSwitcher"
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
            cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">FitPulse</p>
          <p className="text-xs text-muted-foreground">Dashboard</p>
        </div>
      </div>
      <RoleSwitcher />
      <Separator />
      <SidebarNav onNavigate={onNavigate} />
    </div>
  )
}

export function AppLayout() {
  const { role } = useRole()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  if (!isPathAllowed(role, location.pathname)) {
    return <Navigate to={ROLE_NAV[role][0].to} replace />
  }

  const title =
    ROLE_NAV[role].find((i) => location.pathname.startsWith(i.to))?.label ??
    ROLE_LABELS[role]

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-4 md:block">
        <SidebarBody />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="md:hidden"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[role]}
            </p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
