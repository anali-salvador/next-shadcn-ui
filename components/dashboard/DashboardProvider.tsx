"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

// ---------- Tipos ----------

export type ProjectCategory = "web" | "mobile" | "design" | "marketing" | "other"
export type Priority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = "pending" | "in_progress" | "completed"
export type MemberRole = "admin" | "lead" | "developer" | "designer" | "qa" | "viewer"
export type Language = "es" | "en" | "pt"
export type ThemeMode = "light" | "dark" | "system"

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  priority: Priority
  memberIds: string[]
}

export interface Member {
  id: string
  userId: string
  role: MemberRole
  name: string
  email: string
  position: string
  birthdate: string // yyyy-MM-dd
  phone: string
  projectId: string // "" = sin proyecto
  isActive: boolean
}

export interface Task {
  id: string
  description: string
  projectId: string
  status: TaskStatus
  priority: Priority
  userId: string // userId del miembro; "" = sin asignar
  dateline: string // yyyy-MM-dd
}

export interface Settings {
  workspaceName: string
  contactEmail: string
  language: Language
  emailNotifications: boolean
  pushNotifications: boolean
  weeklySummary: boolean
  theme: ThemeMode
}

export interface Activity {
  id: string
  user: string
  action: string
  target: string
  time: string
}

// ---------- Etiquetas ----------

export const categoryLabels: Record<ProjectCategory, string> = {
  web: "Desarrollo Web",
  mobile: "Desarrollo Mobile",
  design: "Diseño",
  marketing: "Marketing",
  other: "Otro",
}

export const priorityLabels: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
}

export const statusLabels: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completado",
}

export const roleLabels: Record<MemberRole, string> = {
  admin: "Administrador",
  lead: "Líder de equipo",
  developer: "Desarrollador",
  designer: "Diseñador",
  qa: "QA / Tester",
  viewer: "Observador",
}

export const languageLabels: Record<Language, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
}

export const themeLabels: Record<ThemeMode, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Según el sistema",
}

// ---------- Utilidades ----------

/** Simula una petición al backend (1 segundo). */
export function fakeRequest(ms = 1000) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function newId() {
  return crypto.randomUUID()
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
}

export type ProjectStatus = "Planificado" | "En progreso" | "Completado"

/** Progreso y estado del proyecto calculados a partir de sus tareas. */
export function projectProgress(projectId: string, tasks: Task[]) {
  const own = tasks.filter((t) => t.projectId === projectId)
  const done = own.filter((t) => t.status === "completed").length
  const progress = own.length ? Math.round((done / own.length) * 100) : 0
  const status: ProjectStatus =
    own.length === 0 || own.every((t) => t.status === "pending")
      ? "Planificado"
      : done === own.length
        ? "Completado"
        : "En progreso"
  return { total: own.length, done, progress, status }
}

// ---------- Datos iniciales (en memoria) ----------

const initialMembers: Member[] = [
  { id: "m1", userId: "USR-001", role: "developer", name: "María García", email: "maria@example.com", position: "Frontend Developer", birthdate: "1995-04-12", phone: "987654321", projectId: "p1", isActive: true },
  { id: "m2", userId: "USR-002", role: "developer", name: "Juan Pérez", email: "juan@example.com", position: "Backend Developer", birthdate: "1992-09-30", phone: "912345678", projectId: "p1", isActive: true },
  { id: "m3", userId: "USR-003", role: "designer", name: "Ana López", email: "ana@example.com", position: "UI/UX Designer", birthdate: "1998-01-22", phone: "923456789", projectId: "p2", isActive: false },
  { id: "m4", userId: "USR-004", role: "lead", name: "Carlos Ruiz", email: "carlos@example.com", position: "DevOps Engineer", birthdate: "1990-06-05", phone: "934567890", projectId: "p4", isActive: true },
  { id: "m5", userId: "USR-005", role: "admin", name: "Laura Martínez", email: "laura@example.com", position: "Project Manager", birthdate: "1988-11-17", phone: "945678901", projectId: "p3", isActive: true },
]

const initialProjects: Project[] = [
  { id: "p1", name: "E-commerce Platform", description: "Plataforma de comercio electrónico con Next.js", category: "web", priority: "high", memberIds: ["m1", "m2", "m5"] },
  { id: "p2", name: "Mobile App", description: "Aplicación móvil con React Native", category: "mobile", priority: "medium", memberIds: ["m3", "m1"] },
  { id: "p3", name: "Dashboard Analytics", description: "Panel de análisis con visualizaciones", category: "web", priority: "low", memberIds: ["m5"] },
  { id: "p4", name: "API Gateway", description: "Microservicios con Node.js", category: "web", priority: "urgent", memberIds: ["m2", "m4"] },
  { id: "p5", name: "Design System", description: "Librería de componentes reutilizables", category: "design", priority: "medium", memberIds: ["m3"] },
  { id: "p6", name: "Marketing Website", description: "Sitio web institucional", category: "marketing", priority: "low", memberIds: ["m5", "m3"] },
]

const initialTasks: Task[] = [
  { id: "t1", description: "Implementar autenticación", projectId: "p1", status: "in_progress", priority: "high", userId: "USR-001", dateline: "2025-11-15" },
  { id: "t2", description: "Diseñar pantalla de perfil", projectId: "p2", status: "pending", priority: "medium", userId: "USR-003", dateline: "2025-11-20" },
  { id: "t3", description: "Configurar CI/CD", projectId: "p4", status: "completed", priority: "high", userId: "USR-004", dateline: "2025-11-10" },
  { id: "t4", description: "Optimizar queries SQL", projectId: "p1", status: "in_progress", priority: "urgent", userId: "USR-002", dateline: "2025-11-12" },
  { id: "t5", description: "Documentar API endpoints", projectId: "p4", status: "pending", priority: "low", userId: "USR-005", dateline: "2025-11-25" },
  { id: "t6", description: "Crear componentes base", projectId: "p5", status: "completed", priority: "medium", userId: "USR-003", dateline: "2025-10-30" },
  { id: "t7", description: "Publicar landing page", projectId: "p6", status: "completed", priority: "medium", userId: "USR-005", dateline: "2025-10-28" },
  { id: "t8", description: "Integrar pasarela de pagos", projectId: "p1", status: "pending", priority: "urgent", userId: "USR-002", dateline: "2025-12-01" },
  { id: "t9", description: "Definir métricas del panel", projectId: "p3", status: "in_progress", priority: "medium", userId: "USR-005", dateline: "2025-11-18" },
]

const initialActivity: Activity[] = [
  { id: "a1", user: "María García", action: "completó la tarea", target: "Diseño de UI", time: "Hace 5 min" },
  { id: "a2", user: "Juan Pérez", action: "comentó en", target: "API Backend", time: "Hace 1 hora" },
  { id: "a3", user: "Ana López", action: "creó un nuevo", target: "Proyecto Mobile", time: "Hace 2 horas" },
  { id: "a4", user: "Carlos Ruiz", action: "actualizó", target: "Documentación", time: "Hace 3 horas" },
]

const initialSettings: Settings = {
  workspaceName: "Mi Workspace",
  contactEmail: "contacto@example.com",
  language: "es",
  emailNotifications: true,
  pushNotifications: false,
  weeklySummary: true,
  theme: "light",
}

// ---------- Contexto ----------

interface DashboardContextValue {
  projects: Project[]
  members: Member[]
  tasks: Task[]
  settings: Settings
  activity: Activity[]
  addProject: (data: Omit<Project, "id">) => void
  deleteProject: (id: string) => void
  addMember: (data: Omit<Member, "id">) => void
  updateMember: (id: string, data: Omit<Member, "id">) => void
  deleteMember: (id: string) => void
  addTask: (data: Omit<Task, "id">) => void
  updateTask: (id: string, data: Omit<Task, "id">) => void
  deleteTasks: (ids: string[]) => void
  saveSettings: (data: Settings) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [activity, setActivity] = useState<Activity[]>(initialActivity)

  // Aplica el tema elegido en Configuración.
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && media.matches)
      root.classList.toggle("dark", dark)
    }
    apply()
    media.addEventListener("change", apply)
    return () => {
      media.removeEventListener("change", apply)
      root.classList.remove("dark")
    }
  }, [settings.theme])

  const value = useMemo<DashboardContextValue>(() => {
    const log = (action: string, target: string) => {
      const time = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
      setActivity((prev) =>
        [{ id: newId(), user: "Tú", action, target, time: `Hoy, ${time}` }, ...prev].slice(0, 8)
      )
    }

    return {
      projects,
      members,
      tasks,
      settings,
      activity,

      addProject: (data) => {
        const id = newId()
        setProjects((prev) => [...prev, { ...data, id }])
        // Los miembros sin proyecto principal quedan asignados al nuevo.
        setMembers((prev) =>
          prev.map((m) => (data.memberIds.includes(m.id) && !m.projectId ? { ...m, projectId: id } : m))
        )
        log("creó el proyecto", data.name)
      },
      deleteProject: (id) => {
        const project = projects.find((p) => p.id === id)
        setProjects((prev) => prev.filter((p) => p.id !== id))
        setTasks((prev) => prev.filter((t) => t.projectId !== id))
        setMembers((prev) => prev.map((m) => (m.projectId === id ? { ...m, projectId: "" } : m)))
        if (project) log("eliminó el proyecto", project.name)
      },

      addMember: (data) => {
        const id = newId()
        setMembers((prev) => [...prev, { ...data, id }])
        // Mantener el equipo del proyecto sincronizado.
        if (data.projectId) {
          setProjects((prev) =>
            prev.map((p) => (p.id === data.projectId ? { ...p, memberIds: [...p.memberIds, id] } : p))
          )
        }
        log("agregó al miembro", data.name)
      },
      updateMember: (id, data) => {
        const previous = members.find((m) => m.id === id)
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...data, id } : m)))
        // Si cambió de proyecto, sale del equipo anterior y entra al nuevo.
        if (previous && previous.projectId !== data.projectId) {
          setProjects((prev) =>
            prev.map((p) => {
              if (p.id === previous.projectId) return { ...p, memberIds: p.memberIds.filter((m) => m !== id) }
              if (p.id === data.projectId && !p.memberIds.includes(id)) return { ...p, memberIds: [...p.memberIds, id] }
              return p
            })
          )
        }
        // Si cambió el userId, mantener las tareas asignadas.
        if (previous && previous.userId !== data.userId) {
          setTasks((prev) =>
            prev.map((t) => (t.userId === previous.userId ? { ...t, userId: data.userId } : t))
          )
        }
        log("actualizó al miembro", data.name)
      },
      deleteMember: (id) => {
        const member = members.find((m) => m.id === id)
        setMembers((prev) => prev.filter((m) => m.id !== id))
        setProjects((prev) =>
          prev.map((p) => ({ ...p, memberIds: p.memberIds.filter((mid) => mid !== id) }))
        )
        if (member) {
          setTasks((prev) =>
            prev.map((t) => (t.userId === member.userId ? { ...t, userId: "" } : t))
          )
          log("eliminó al miembro", member.name)
        }
      },

      addTask: (data) => {
        setTasks((prev) => [{ ...data, id: newId() }, ...prev])
        log("creó la tarea", data.description)
      },
      updateTask: (id, data) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...data, id } : t)))
        log(data.status === "completed" ? "completó la tarea" : "actualizó la tarea", data.description)
      },
      deleteTasks: (ids) => {
        setTasks((prev) => prev.filter((t) => !ids.includes(t.id)))
        log("eliminó", ids.length === 1 ? "1 tarea" : `${ids.length} tareas`)
      },

      saveSettings: (data) => {
        setSettings(data)
        log("actualizó la configuración de", data.workspaceName)
      },
    }
  }, [projects, members, tasks, settings, activity])

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard debe usarse dentro de <DashboardProvider>")
  return ctx
}
