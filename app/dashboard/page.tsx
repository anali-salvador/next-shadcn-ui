"use client"

import {
  Activity,
  CheckCircle2,
  Clock3,
  FolderHeart,
  Gauge,
  Heart,
  LayoutDashboard,
  ListTodo,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProjectForm } from "@/components/ProjectForm"
import { TasksTable } from "@/components/TaskTable"
import { ProjectsView } from "@/components/dashboard/ProjectsView"
import { TeamView } from "@/components/dashboard/TeamView"
import { SettingsForm } from "@/components/dashboard/SettingsForm"
import { IconBubble, KawaiiBackground, ProgressBar, type PastelTone } from "@/components/dashboard/Kawaii"
import {
  DashboardProvider,
  initials,
  priorityLabels,
  projectProgress,
  statusLabels,
  useDashboard,
  type Priority,
  type TaskStatus,
} from "@/components/dashboard/DashboardProvider"

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  )
}

const statusTone: Record<TaskStatus, PastelTone> = {
  pending: "peach",
  in_progress: "sky",
  completed: "mint",
}

const priorityTone: Record<Priority, PastelTone> = {
  low: "mint",
  medium: "sky",
  high: "lilac",
  urgent: "pink",
}

const dotTone: Record<PastelTone, string> = {
  pink: "bg-pastel-pink",
  lilac: "bg-pastel-lilac",
  sky: "bg-pastel-sky",
  mint: "bg-pastel-mint",
  peach: "bg-pastel-peach",
}

const avatarTones = [
  "bg-pastel-pink-soft text-pastel-pink-ink",
  "bg-pastel-lilac-soft text-pastel-lilac-ink",
  "bg-pastel-sky-soft text-pastel-sky-ink",
  "bg-pastel-mint-soft text-pastel-mint-ink",
  "bg-pastel-peach-soft text-pastel-peach-ink",
]

const tabs: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "overview", label: "Resumen", icon: LayoutDashboard },
  { value: "projects", label: "Proyectos", icon: FolderHeart },
  { value: "tasks", label: "Tareas", icon: ListTodo },
  { value: "team", label: "Equipo", icon: Users },
  { value: "settings", label: "Configuración", icon: Settings },
]

function StatCard({
  title,
  value,
  hint,
  icon,
  tone,
}: {
  title: string
  value: React.ReactNode
  hint: string
  icon: LucideIcon
  tone: PastelTone
}) {
  return (
    <Card className="kawaii-hover transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <IconBubble icon={icon} tone={tone} />
      </CardHeader>
      <CardContent>
        <div className="font-heading text-3xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function BarRow({ label, count, total, tone }: { label: string; count: number; total: number; tone: PastelTone }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${dotTone[tone]}`} />
          {label}
        </span>
        <span className="text-muted-foreground">
          {count} · {pct}%
        </span>
      </div>
      <ProgressBar value={pct} tone={tone} />
    </div>
  )
}

function Dashboard() {
  const { projects, tasks, members, activity, settings } = useDashboard()

  // Métricas calculadas a partir de los datos en memoria
  const byStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s).length
  const byPriority = (p: Priority) => tasks.filter((t) => t.priority === p).length
  const completed = byStatus("completed")
  const activeMembers = members.filter((m) => m.isActive).length
  const projectStates = projects.map((p) => projectProgress(p.id, tasks).status)
  const projectsInProgress = projectStates.filter((s) => s === "En progreso").length
  const projectsDone = projectStates.filter((s) => s === "Completado").length
  const urgentOpen = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length
  const overall = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  return (
    <div className="relative isolate min-h-screen p-4 sm:p-8">
      <KawaiiBackground />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="animate-pop-in mb-8 rounded-4xl border border-pastel-pink/70 bg-card/70 p-5 shadow-[0_14px_40px_-20px_var(--pastel-lilac)] backdrop-blur-md sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-pastel-pink to-pastel-lilac text-white shadow-[0_8px_20px_-8px_var(--primary)]">
                  <Sparkles className="size-6" />
                </span>
                <h1 className="bg-linear-to-r from-pastel-pink-ink via-pastel-lilac-ink to-pastel-sky-ink bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
                  Dashboard de Proyectos
                </h1>
                <Badge variant="lilac">
                  <Heart data-icon="inline-start" fill="currentColor" />
                  {settings.workspaceName}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Gestiona tus proyectos y tareas con shadcn/ui
              </p>
            </div>
            <div className="pt-4 sm:pt-0">
              <ProjectForm />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <TabsList className="h-auto! gap-1 rounded-full border border-pastel-pink/70 bg-card/80 p-1.5 shadow-[0_8px_24px_-14px_var(--pastel-lilac)] backdrop-blur-md">
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-9 flex-none rounded-full px-3.5 text-muted-foreground transition-all hover:bg-pastel-pink-soft hover:text-pastel-pink-ink data-active:bg-linear-to-r data-active:from-pastel-pink data-active:to-pastel-lilac data-active:text-pastel-pink-ink data-active:shadow-[0_6px_16px_-8px_var(--primary)] sm:px-4"
                >
                  <Icon data-icon="inline-start" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab: Overview */}
          <TabsContent value="overview" className="animate-pop-in space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Proyectos"
                value={projects.length}
                hint={`${projectsInProgress} en progreso · ${projectsDone} completados`}
                icon={FolderHeart}
                tone="pink"
              />
              <StatCard
                title="Tareas Completadas"
                value={`${completed}/${tasks.length}`}
                hint={`${overall}% del total de tareas`}
                icon={CheckCircle2}
                tone="mint"
              />
              <StatCard
                title="Tareas Pendientes"
                value={byStatus("pending") + byStatus("in_progress")}
                hint={`${urgentOpen} urgente(s) sin terminar`}
                icon={Clock3}
                tone="peach"
              />
              <StatCard
                title="Miembros Activos"
                value={activeMembers}
                hint={`${members.length} miembro(s) en total`}
                icon={Users}
                tone="sky"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-start gap-3">
                  <IconBubble icon={Gauge} tone="sky" />
                  <div className="space-y-1">
                    <CardTitle>Tareas por Estado</CardTitle>
                    <CardDescription>Distribución actual de {tasks.length} tarea(s)</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(Object.keys(statusLabels) as TaskStatus[]).map((s) => (
                    <BarRow key={s} label={statusLabels[s]} count={byStatus(s)} total={tasks.length} tone={statusTone[s]} />
                  ))}
                  <div className="rounded-2xl bg-pastel-mint-soft/70 p-3 text-sm text-pastel-mint-ink">
                    Avance general del equipo: <strong>{overall}%</strong>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-start gap-3">
                  <IconBubble icon={ListTodo} tone="lilac" />
                  <div className="space-y-1">
                    <CardTitle>Tareas por Prioridad</CardTitle>
                    <CardDescription>Cuánto trabajo hay en cada nivel</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(Object.keys(priorityLabels) as Priority[]).map((p) => (
                    <BarRow key={p} label={priorityLabels[p]} count={byPriority(p)} total={tasks.length} tone={priorityTone[p]} />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-start gap-3">
                <IconBubble icon={Activity} tone="peach" />
                <div className="space-y-1">
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>
                    Últimas actualizaciones de tus proyectos
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activity.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-pastel-pink-soft/60"
                    >
                      <Avatar>
                        <AvatarFallback className={avatarTones[i % avatarTones.length]}>
                          {initials(item.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-none">
                          {item.user}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {item.action} <span className="font-medium text-foreground">{item.target}</span>
                        </p>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {item.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Projects */}
          <TabsContent value="projects" className="animate-pop-in space-y-4">
            <ProjectsView />
          </TabsContent>

          {/* Tab: Tasks */}
          <TabsContent value="tasks" className="animate-pop-in space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-start gap-3">
                <IconBubble icon={ListTodo} tone="mint" />
                <div className="space-y-1">
                  <CardTitle>Gestión de Tareas</CardTitle>
                  <CardDescription>
                    Administra todas las tareas de tus proyectos
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <TasksTable />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Team */}
          <TabsContent value="team" className="animate-pop-in space-y-4">
            <TeamView />
          </TabsContent>

          {/* Tab: Settings */}
          <TabsContent value="settings" className="animate-pop-in">
            <SettingsForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
