"use client"

import { useState } from "react"
import { CalendarDays, Eye, FolderHeart, Trash2Icon, UsersIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { formatDate } from "@/components/dashboard/DatePicker"
import { IconBubble, ProgressBar, type PastelTone } from "@/components/dashboard/Kawaii"
import {
  categoryLabels,
  fakeRequest,
  initials,
  priorityLabels,
  projectProgress,
  statusLabels,
  useDashboard,
  type Project,
  type ProjectStatus,
} from "@/components/dashboard/DashboardProvider"

const statusVariant = (status: ProjectStatus) =>
  status === "Completado" ? "mint" : status === "En progreso" ? "sky" : "peach"

const cardTones: PastelTone[] = ["pink", "lilac", "sky", "mint", "peach"]

export function ProjectsView() {
  const { projects, members, tasks, deleteProject } = useDashboard()
  const [detail, setDetail] = useState<Project | null>(null)
  const [toDelete, setToDelete] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    await fakeRequest()
    deleteProject(toDelete.id)
    setDeleting(false)
    setToDelete(null)
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No hay proyectos. Crea uno con el botón “Nuevo Proyecto”.
        </CardContent>
      </Card>
    )
  }

  const detailMembers = detail ? members.filter((m) => detail.memberIds.includes(m.id)) : []
  const detailTasks = detail ? tasks.filter((t) => t.projectId === detail.id) : []
  const detailStats = detail ? projectProgress(detail.id, tasks) : null
  const deleteTaskCount = toDelete ? tasks.filter((t) => t.projectId === toDelete.id).length : 0

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => {
          const { progress, status } = projectProgress(project.id, tasks)
          return (
            <Card key={project.id} className="kawaii-hover transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <IconBubble icon={FolderHeart} tone={cardTones[i % cardTones.length]} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.description || "Sin descripción"}</CardDescription>
                  </div>
                  <Badge variant={statusVariant(status)}>{status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="h-4 w-4" />
                      {project.memberIds.length} miembros
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setDetail(project)}>
                        <Eye data-icon="inline-start" />
                        Ver detalles
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive"
                        aria-label={`Eliminar ${project.name}`}
                        onClick={() => setToDelete(project)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detalles */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="sm:max-w-[560px]">
          {detail && detailStats && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.name}</DialogTitle>
                <DialogDescription>{detail.description || "Sin descripción"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusVariant(detailStats.status)}>{detailStats.status}</Badge>
                  <Badge variant="lilac">{categoryLabels[detail.category]}</Badge>
                  <Badge variant={detail.priority === "urgent" ? "pink" : "peach"}>
                    Prioridad {priorityLabels[detail.priority].toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {detailStats.done} de {detailStats.total} tareas completadas
                    </span>
                    <span className="font-medium">{detailStats.progress}%</span>
                  </div>
                  <ProgressBar value={detailStats.progress} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Miembros del equipo ({detailMembers.length})</h4>
                  {detailMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin miembros asignados.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {detailMembers.map((m) => (
                        <div key={m.id} className="flex items-center gap-2 rounded-full border border-pastel-lilac bg-pastel-lilac-soft/60 py-1 pr-3 pl-1">
                          <Avatar className="size-6">
                            <AvatarFallback className="bg-pastel-pink-soft text-[10px] text-pastel-pink-ink">{initials(m.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{m.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Tareas ({detailTasks.length})</h4>
                  {detailTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Este proyecto aún no tiene tareas.</p>
                  ) : (
                    <ul className="max-h-48 space-y-1 overflow-y-auto">
                      {detailTasks.map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-pastel-pink-soft/60 px-3 py-1.5 text-sm">
                          <span className="truncate">{t.description}</span>
                          <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                            <CalendarDays className="size-3" />
                            {formatDate(t.dateline)}
                            <Badge variant={t.status === "completed" ? "mint" : t.status === "in_progress" ? "sky" : "peach"}>{statusLabels[t.status]}</Badge>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminación */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar proyecto?</DialogTitle>
            <DialogDescription>
              Se eliminará <strong>{toDelete?.name}</strong>
              {deleteTaskCount > 0 && ` junto con sus ${deleteTaskCount} tarea(s)`}. Esta acción no se puede deshacer.
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
