"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { ErrorAlert, type FormErrors } from "@/components/dashboard/FormAlerts"
import {
  categoryLabels,
  fakeRequest,
  initials,
  priorityLabels,
  useDashboard,
  type Priority,
  type ProjectCategory,
} from "@/components/dashboard/DashboardProvider"

const emptyForm = {
  name: "",
  description: "",
  category: "",
  priority: "",
  memberIds: [] as string[],
}

export function ProjectForm() {
  const { members, projects, addProject } = useDashboard()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  // Tras el primer intento de envío, los errores se recalculan en vivo.
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  const validate = () => {
    const e: FormErrors = {}
    const name = formData.name.trim()
    if (!name) e.name = "El nombre del proyecto es obligatorio."
    else if (name.length < 3) e.name = "El nombre debe tener al menos 3 caracteres."
    else if (projects.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      e.name = "Ya existe un proyecto con ese nombre."
    if (!formData.category) e.category = "Selecciona una categoría."
    if (!formData.priority) e.priority = "Selecciona la prioridad."
    if (formData.memberIds.length === 0) e.memberIds = "Asigna al menos un miembro del equipo."
    return e
  }

  const errors: FormErrors = submitted ? validate() : {}

  const toggleMember = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: checked ? [...prev.memberIds, id] : prev.memberIds.filter((m) => m !== id),
    }))
  }

  const handleOpenChange = (value: boolean) => {
    if (saving) return
    setOpen(value)
    if (!value) {
      setFormData(emptyForm)
      setSubmitted(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate()
    setSubmitted(true)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    await fakeRequest()
    addProject({
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category as ProjectCategory,
      priority: formData.priority as Priority,
      memberIds: formData.memberIds,
    })
    setSaving(false)

    // Limpiar y cerrar
    setFormData(emptyForm)
    setSubmitted(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Nuevo Proyecto
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
            <DialogDescription>
              Completa la información del proyecto. Click en guardar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-1">
            <ErrorAlert errors={errors} />

            <div className="grid gap-2">
              <Label htmlFor="name">
                Nombre del Proyecto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Mi Proyecto Increíble"
                value={formData.name}
                aria-invalid={!!errors.name || undefined}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Breve descripción del proyecto..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <Select
                items={categoryLabels}
                value={formData.category || null}
                onValueChange={(value) => setFormData({ ...formData, category: value ?? "" })}
              >
                <SelectTrigger id="category" className="w-full" aria-invalid={!!errors.category || undefined}>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Desarrollo Web</SelectItem>
                  <SelectItem value="mobile">Desarrollo Mobile</SelectItem>
                  <SelectItem value="design">Diseño</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">
                Prioridad <span className="text-destructive">*</span>
              </Label>
              <Select
                items={priorityLabels}
                value={formData.priority || null}
                onValueChange={(value) => setFormData({ ...formData, priority: value ?? "" })}
              >
                <SelectTrigger id="priority" className="w-full" aria-invalid={!!errors.priority || undefined}>
                  <SelectValue placeholder="Selecciona la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>
                Miembros del Equipo <span className="text-destructive">*</span>
              </Label>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay miembros registrados. Agrégalos en la pestaña Equipo.
                </p>
              ) : (
                <div className="grid gap-1 rounded-2xl border border-pastel-lilac bg-pastel-lilac-soft/40 p-2 sm:grid-cols-2">
                  {members.map((member) => (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-2 rounded-xl p-1.5 text-sm transition-colors hover:bg-pastel-pink-soft"
                    >
                      <Checkbox
                        checked={formData.memberIds.includes(member.id)}
                        onCheckedChange={(checked) => toggleMember(member.id, checked)}
                      />
                      <Avatar className="size-6">
                        <AvatarFallback className="bg-pastel-pink-soft text-[10px] text-pastel-pink-ink">{initials(member.name)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{member.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.memberIds.length} miembro(s) seleccionado(s)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Spinner data-icon="inline-start" />}
              {saving ? "Guardando..." : "Crear Proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
