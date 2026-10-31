"use client"

import { useState } from "react"
import { BriefcaseIcon, CakeIcon, MailIcon, PencilIcon, PhoneIcon, Trash2Icon, UserPlus, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { DatePicker, formatDate } from "@/components/dashboard/DatePicker"
import { EMAIL_RE, ErrorAlert, type FormErrors } from "@/components/dashboard/FormAlerts"
import { IconBubble } from "@/components/dashboard/Kawaii"
import {
  fakeRequest,
  initials,
  roleLabels,
  useDashboard,
  type Member,
  type MemberRole,
} from "@/components/dashboard/DashboardProvider"

const NO_PROJECT = "none"

const avatarTones = [
  "bg-pastel-pink-soft text-pastel-pink-ink",
  "bg-pastel-lilac-soft text-pastel-lilac-ink",
  "bg-pastel-sky-soft text-pastel-sky-ink",
  "bg-pastel-mint-soft text-pastel-mint-ink",
  "bg-pastel-peach-soft text-pastel-peach-ink",
]
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/

type MemberForm = Omit<Member, "id" | "role"> & { role: string }

const emptyMember: MemberForm = {
  userId: "",
  role: "",
  name: "",
  email: "",
  position: "",
  birthdate: "",
  phone: "",
  projectId: "",
  isActive: true,
}

export function TeamView() {
  const { members, projects, tasks, addMember, updateMember, deleteMember } = useDashboard()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [form, setForm] = useState<MemberForm>(emptyMember)
  // Tras el primer intento de envío, los errores se recalculan en vivo.
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const [toDelete, setToDelete] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState(false)

  const projectItems = {
    [NO_PROJECT]: "Sin proyecto",
    ...Object.fromEntries(projects.map((p) => [p.id, p.name])),
  }
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "Sin proyecto"

  const openCreate = () => {
    setEditing(null)
    const next = Math.max(0, ...members.map((m) => Number(m.userId.replace(/\D/g, "")) || 0)) + 1
    setForm({ ...emptyMember, userId: `USR-${String(next).padStart(3, "0")}` })
    setSubmitted(false)
    setFormOpen(true)
  }

  const openEdit = (member: Member) => {
    setEditing(member)
    setForm({ ...member })
    setSubmitted(false)
    setFormOpen(true)
  }

  const validate = () => {
    const e: FormErrors = {}
    const others = members.filter((m) => m.id !== editing?.id)
    const userId = form.userId.trim()
    const email = form.email.trim().toLowerCase()

    if (!userId) e.userId = "El ID de usuario es obligatorio."
    else if (others.some((m) => m.userId.toLowerCase() === userId.toLowerCase()))
      e.userId = "Ese ID de usuario ya está registrado."
    if (!form.name.trim()) e.name = "El nombre es obligatorio."
    if (!email) e.email = "El correo es obligatorio."
    else if (!EMAIL_RE.test(email)) e.email = "El correo no tiene un formato válido."
    else if (others.some((m) => m.email.toLowerCase() === email)) e.email = "Ese correo ya está registrado."
    if (!form.role) e.role = "Selecciona un rol."
    if (!form.position.trim()) e.position = "El cargo es obligatorio."
    if (!form.birthdate) e.birthdate = "Elige la fecha de nacimiento."
    else {
      const birth = new Date(form.birthdate)
      const adult = new Date()
      adult.setFullYear(adult.getFullYear() - 18)
      if (birth > adult) e.birthdate = "El miembro debe ser mayor de 18 años."
    }
    if (!form.phone.trim()) e.phone = "El teléfono es obligatorio."
    else if (!PHONE_RE.test(form.phone.trim())) e.phone = "El teléfono debe tener entre 7 y 15 dígitos."
    return e
  }

  const errors: FormErrors = submitted ? validate() : {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate()
    setSubmitted(true)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    await fakeRequest()
    const data: Omit<Member, "id"> = {
      ...form,
      userId: form.userId.trim(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      position: form.position.trim(),
      phone: form.phone.trim(),
      role: form.role as MemberRole,
    }
    if (editing) updateMember(editing.id, data)
    else addMember(data)
    setSaving(false)
    setFormOpen(false)
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    await fakeRequest()
    deleteMember(toDelete.id)
    setDeleting(false)
    setToDelete(null)
  }

  const assignedTasks = toDelete ? tasks.filter((t) => t.userId === toDelete.userId).length : 0

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <IconBubble icon={Users} tone="sky" />
            <div className="space-y-1.5">
            <CardTitle>Miembros del Equipo</CardTitle>
            <CardDescription>Gestiona los miembros de tu equipo y sus roles</CardDescription>
            </div>
          </div>
          <Button onClick={openCreate}>
            <UserPlus data-icon="inline-start" />
            Nuevo Miembro
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No hay miembros registrados.</p>
            )}
            {members.map((member, i) => (
              <div
                key={member.id}
                className="kawaii-hover flex flex-col gap-3 rounded-2xl border border-pastel-pink/60 bg-card/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-pastel-pink-soft/40 hover:shadow-[0_10px_24px_-16px_var(--pastel-lilac)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="size-10">
                    <AvatarFallback className={avatarTones[i % avatarTones.length]}>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {member.name} <span className="text-xs font-normal text-muted-foreground">· {member.userId}</span>
                    </p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <BriefcaseIcon className="size-3.5" /> {member.position} · {roleLabels[member.role]}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MailIcon className="size-3" /> {member.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <PhoneIcon className="size-3" /> {member.phone}
                      </span>
                      <span className="flex items-center gap-1"><CakeIcon className="size-3" /> {formatDate(member.birthdate)}</span>
                      <span>Proyecto: {projectName(member.projectId)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.isActive ? "mint" : "peach"}>
                    {member.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => openEdit(member)}>
                    <PencilIcon data-icon="inline-start" />
                    Editar
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive"
                    aria-label={`Eliminar ${member.name}`}
                    onClick={() => setToDelete(member)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crear / editar */}
      <Dialog open={formOpen} onOpenChange={(v) => !saving && setFormOpen(v)}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Miembro" : "Nuevo Miembro"}</DialogTitle>
              <DialogDescription>
                {editing ? "Actualiza los datos del miembro." : "Registra un nuevo miembro del equipo."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-[65vh] gap-4 overflow-y-auto py-4 pr-1">
              <ErrorAlert errors={errors} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="m-userId">ID de usuario *</Label>
                  <Input
                    id="m-userId"
                    value={form.userId}
                    aria-invalid={!!errors.userId || undefined}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-name">Nombre completo *</Label>
                  <Input
                    id="m-name"
                    placeholder="Ej. Rosa Quispe"
                    value={form.name}
                    aria-invalid={!!errors.name || undefined}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-email">Correo *</Label>
                  <Input
                    id="m-email"
                    type="email"
                    placeholder="nombre@empresa.com"
                    value={form.email}
                    aria-invalid={!!errors.email || undefined}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-phone">Teléfono *</Label>
                  <Input
                    id="m-phone"
                    type="tel"
                    placeholder="987654321"
                    value={form.phone}
                    aria-invalid={!!errors.phone || undefined}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-role">Rol *</Label>
                  <Select
                    items={roleLabels}
                    value={form.role || null}
                    onValueChange={(v) => setForm({ ...form, role: v ?? "" })}
                  >
                    <SelectTrigger id="m-role" className="w-full" aria-invalid={!!errors.role || undefined}>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-position">Cargo *</Label>
                  <Input
                    id="m-position"
                    placeholder="Ej. Frontend Developer"
                    value={form.position}
                    aria-invalid={!!errors.position || undefined}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-birthdate">Fecha de nacimiento *</Label>
                  <DatePicker
                    id="m-birthdate"
                    value={form.birthdate}
                    withDropdowns
                    fromYear={1940}
                    toYear={2015}
                    invalid={!!errors.birthdate}
                    onChange={(birthdate) => setForm({ ...form, birthdate })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-project">Proyecto</Label>
                  <Select
                    items={projectItems}
                    value={form.projectId || NO_PROJECT}
                    onValueChange={(v) => setForm({ ...form, projectId: !v || v === NO_PROJECT ? "" : v })}
                  >
                    <SelectTrigger id="m-project" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PROJECT}>Sin proyecto</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-pastel-mint bg-pastel-mint-soft/50 p-3">
                <div>
                  <Label htmlFor="m-active">Miembro activo</Label>
                  <p className="text-xs text-muted-foreground">Los miembros inactivos no cuentan en las métricas.</p>
                </div>
                <Switch
                  id="m-active"
                  checked={form.isActive}
                  onCheckedChange={(isActive) => setForm({ ...form, isActive })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={saving} onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Spinner data-icon="inline-start" />}
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear miembro"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminación */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar miembro?</DialogTitle>
            <DialogDescription>
              Se eliminará a <strong>{toDelete?.name}</strong> de todos los proyectos
              {assignedTasks > 0 && ` y sus ${assignedTasks} tarea(s) quedarán sin asignar`}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? <Spinner data-icon="inline-start" /> : <Trash2Icon data-icon="inline-start" />}
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
