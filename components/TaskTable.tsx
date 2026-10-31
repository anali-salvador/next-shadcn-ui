"use client"

import { useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { DatePicker, formatDate } from "@/components/dashboard/DatePicker"
import { ErrorAlert, type FormErrors } from "@/components/dashboard/FormAlerts"
import {
  fakeRequest,
  priorityLabels,
  statusLabels,
  useDashboard,
  type Priority,
  type Task,
  type TaskStatus,
} from "@/components/dashboard/DashboardProvider"

const PAGE_SIZE = 5

const statusVariant = (status: TaskStatus) => {
  switch (status) {
    case "completed":
      return "mint"
    case "in_progress":
      return "sky"
    case "pending":
      return "peach"
    default:
      return "outline"
  }
}

const priorityVariant = (priority: Priority) => {
  switch (priority) {
    case "urgent":
      return "pink"
    case "high":
      return "lilac"
    case "medium":
      return "sky"
    case "low":
      return "mint"
    default:
      return "outline"
  }
}

type TaskFormState = {
  description: string
  projectId: string
  status: string
  priority: string
  userId: string
  dateline: string
}

const emptyTask: TaskFormState = {
  description: "",
  projectId: "",
  status: "pending",
  priority: "",
  userId: "",
  dateline: "",
}

export function TasksTable() {
  const { tasks, projects, members, addTask, updateTask, deleteTasks } = useDashboard()

  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [deleting, setDeleting] = useState<string[] | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskFormState>(emptyTask)
  // Tras el primer intento de envío, los errores se recalculan en vivo.
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Ignora selecciones de tareas que ya no existen (p. ej. al borrar un proyecto).
  const selectedIds = selected.filter((id) => tasks.some((t) => t.id === id))

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageTasks = tasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—"
  const memberName = (userId: string) =>
    members.find((m) => m.userId === userId)?.name ?? "Sin asignar"

  const projectItems = Object.fromEntries(projects.map((p) => [p.id, p.name]))
  const memberItems = Object.fromEntries(members.map((m) => [m.userId, `${m.name} (${m.userId})`]))

  // ----- Selección -----
  const allPageSelected = pageTasks.length > 0 && pageTasks.every((t) => selectedIds.includes(t.id))
  const toggleAll = (checked: boolean) =>
    setSelected((prev) =>
      checked
        ? Array.from(new Set([...prev, ...pageTasks.map((t) => t.id)]))
        : prev.filter((id) => !pageTasks.some((t) => t.id === id))
    )
  const toggleOne = (id: string, checked: boolean) =>
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((s) => s !== id)))

  // ----- Formulario -----
  const openCreate = () => {
    setEditing(null)
    setForm(emptyTask)
    setSubmitted(false)
    setFormOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditing(task)
    setForm({ ...task })
    setSubmitted(false)
    setFormOpen(true)
  }

  const validate = () => {
    const e: FormErrors = {}
    if (!form.description.trim()) e.description = "La descripción es obligatoria."
    else if (form.description.trim().length < 5) e.description = "La descripción debe tener al menos 5 caracteres."
    if (!form.projectId) e.projectId = "Selecciona un proyecto."
    if (!form.status) e.status = "Selecciona un estado."
    if (!form.priority) e.priority = "Selecciona la prioridad."
    if (!form.userId) e.userId = "Asigna la tarea a un miembro."
    if (!form.dateline) e.dateline = "Elige la fecha límite."
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
    const data: Omit<Task, "id"> = {
      description: form.description.trim(),
      projectId: form.projectId,
      status: form.status as TaskStatus,
      priority: form.priority as Priority,
      userId: form.userId,
      dateline: form.dateline,
    }
    if (editing) updateTask(editing.id, data)
    else {
      addTask(data)
      setPage(1)
    }
    setSaving(false)
    setFormOpen(false)
  }

  // ----- Eliminar -----
  const handleDelete = async (ids: string[]) => {
    setDeleting(ids)
    await fakeRequest()
    deleteTasks(ids)
    setSelected((prev) => prev.filter((id) => !ids.includes(id)))
    setDeleting(null)
  }

  const isDeleting = (id: string) => deleting?.includes(id) ?? false

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {tasks.length} tarea(s) · {selectedIds.length} seleccionada(s)
        </p>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" disabled={!!deleting} onClick={() => handleDelete(selectedIds)}>
              {deleting && deleting.length > 1 ? <Spinner data-icon="inline-start" /> : <Trash2Icon data-icon="inline-start" />}
              Eliminar seleccionadas
            </Button>
          )}
          <Button onClick={openCreate} disabled={projects.length === 0}>
            <PlusIcon data-icon="inline-start" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-pastel-pink/70 bg-card/60">
        <Table>
          <TableCaption className="mb-3 font-heading">Lista de todas las tareas del proyecto</TableCaption>
          <TableHeader className="bg-linear-to-r from-pastel-pink-soft via-pastel-lilac-soft to-pastel-sky-soft">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox checked={allPageSelected} onCheckedChange={toggleAll} aria-label="Seleccionar página" />
              </TableHead>
              <TableHead>Tarea</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Asignado a</TableHead>
              <TableHead>Fecha límite</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-20 text-center text-muted-foreground">
                  No hay tareas registradas.
                </TableCell>
              </TableRow>
            )}
            {pageTasks.map((task) => (
              <TableRow key={task.id} className="transition-colors hover:bg-pastel-pink-soft/50 data-[state=selected]:bg-pastel-lilac-soft/70" data-state={selectedIds.includes(task.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(task.id)}
                    onCheckedChange={(checked) => toggleOne(task.id, checked)}
                    aria-label={`Seleccionar ${task.description}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{task.description}</TableCell>
                <TableCell>{projectName(task.projectId)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(task.status)}>{statusLabels[task.status]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariant(task.priority)}>{priorityLabels[task.priority]}</Badge>
                </TableCell>
                <TableCell>{memberName(task.userId)}</TableCell>
                <TableCell>{formatDate(task.dateline)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(task)}>
                      <PencilIcon data-icon="inline-start" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      disabled={!!deleting}
                      onClick={() => handleDelete([task.id])}
                      aria-label="Eliminar tarea"
                    >
                      {isDeleting(task.id) ? <Spinner /> : <Trash2Icon />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text="Anterior"
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  setPage(Math.max(1, currentPage - 1))
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <PaginationItem key={n}>
                <PaginationLink
                  href="#"
                  isActive={n === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(n)
                  }}
                >
                  {n}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                text="Siguiente"
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  setPage(Math.min(totalPages, currentPage + 1))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={formOpen} onOpenChange={(v) => !saving && setFormOpen(v)}>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
              <DialogDescription>
                {editing ? "Modifica los datos de la tarea." : "Registra una nueva tarea para un proyecto."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <ErrorAlert errors={errors} />

              <div className="grid gap-2">
                <Label htmlFor="task-description">Descripción *</Label>
                <Textarea
                  id="task-description"
                  placeholder="¿Qué hay que hacer?"
                  value={form.description}
                  aria-invalid={!!errors.description || undefined}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="task-project">Proyecto *</Label>
                  <Select
                    items={projectItems}
                    value={form.projectId || null}
                    onValueChange={(v) => setForm({ ...form, projectId: v ?? "" })}
                  >
                    <SelectTrigger id="task-project" className="w-full" aria-invalid={!!errors.projectId || undefined}>
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="task-user">Asignado a *</Label>
                  <Select
                    items={memberItems}
                    value={form.userId || null}
                    onValueChange={(v) => setForm({ ...form, userId: v ?? "" })}
                  >
                    <SelectTrigger id="task-user" className="w-full" aria-invalid={!!errors.userId || undefined}>
                      <SelectValue placeholder="Selecciona un miembro" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.userId}>
                          {m.name} ({m.userId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="task-status">Estado *</Label>
                  <Select
                    items={statusLabels}
                    value={form.status || null}
                    onValueChange={(v) => setForm({ ...form, status: v ?? "" })}
                  >
                    <SelectTrigger id="task-status" className="w-full" aria-invalid={!!errors.status || undefined}>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="task-priority">Prioridad *</Label>
                  <Select
                    items={priorityLabels}
                    value={form.priority || null}
                    onValueChange={(v) => setForm({ ...form, priority: v ?? "" })}
                  >
                    <SelectTrigger id="task-priority" className="w-full" aria-invalid={!!errors.priority || undefined}>
                      <SelectValue placeholder="Selecciona la prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-dateline">Fecha límite *</Label>
                <DatePicker
                  id="task-dateline"
                  value={form.dateline}
                  invalid={!!errors.dateline}
                  onChange={(dateline) => setForm({ ...form, dateline })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={saving} onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Spinner data-icon="inline-start" />}
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear tarea"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
