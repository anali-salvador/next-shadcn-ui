"use client"

import { useState } from "react"
import { BellRing, Settings2, SaveIcon } from "lucide-react"
import { IconBubble } from "@/components/dashboard/Kawaii"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { EMAIL_RE, ErrorAlert, SuccessAlert, type FormErrors } from "@/components/dashboard/FormAlerts"
import {
  fakeRequest,
  languageLabels,
  themeLabels,
  useDashboard,
  type Language,
  type Settings,
  type ThemeMode,
} from "@/components/dashboard/DashboardProvider"

export function SettingsForm() {
  const { settings, saveSettings } = useDashboard()
  const [form, setForm] = useState<Settings>(settings)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const validate = () => {
    const found: FormErrors = {}
    if (!form.workspaceName.trim()) found.workspaceName = "El nombre del workspace es obligatorio."
    else if (form.workspaceName.trim().length < 3) found.workspaceName = "El nombre del workspace debe tener al menos 3 caracteres."
    if (!form.contactEmail.trim()) found.contactEmail = "El correo de contacto es obligatorio."
    else if (!EMAIL_RE.test(form.contactEmail.trim())) found.contactEmail = "El correo de contacto no es válido."
    return found
  }

  const errors: FormErrors = submitted ? validate() : {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate()
    setSubmitted(true)
    setSaved(false)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    await fakeRequest()
    saveSettings({ ...form, workspaceName: form.workspaceName.trim(), contactEmail: form.contactEmail.trim() })
    setSaving(false)
    setSaved(true)
  }

  const notifications: { key: "emailNotifications" | "pushNotifications" | "weeklySummary"; label: string; help: string }[] = [
    { key: "emailNotifications", label: "Notificaciones por correo", help: "Recibe un correo cuando te asignen una tarea." },
    { key: "pushNotifications", label: "Notificaciones push", help: "Alertas en el navegador sobre cambios en tus proyectos." },
    { key: "weeklySummary", label: "Resumen semanal", help: "Un informe cada lunes con el avance del equipo." },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3">
        <IconBubble icon={Settings2} tone="lilac" />
        <div className="space-y-1">
          <CardTitle>Configuración</CardTitle>
          <CardDescription>Administra las preferencias de tu cuenta</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="grid max-w-2xl gap-6">
          {saved && (
            <SuccessAlert
              title="Configuración guardada"
              description="Tus preferencias se guardaron correctamente."
            />
          )}
          <ErrorAlert errors={errors} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="s-workspace">Nombre del workspace</Label>
              <Input
                id="s-workspace"
                value={form.workspaceName}
                aria-invalid={!!errors.workspaceName || undefined}
                onChange={(e) => update("workspaceName", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-email">Correo de contacto</Label>
              <Input
                id="s-email"
                type="email"
                value={form.contactEmail}
                aria-invalid={!!errors.contactEmail || undefined}
                onChange={(e) => update("contactEmail", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-language">Idioma</Label>
              <Select
                items={languageLabels}
                value={form.language}
                onValueChange={(v) => v && update("language", v as Language)}
              >
                <SelectTrigger id="s-language" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-theme">Tema</Label>
              <Select
                items={themeLabels}
                value={form.theme}
                onValueChange={(v) => v && update("theme", v as ThemeMode)}
              >
                <SelectTrigger id="s-theme" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(themeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3">
            <h3 className="flex items-center gap-2 text-base font-medium"><BellRing className="size-4 text-pastel-pink-ink" /> Notificaciones</h3>
            {notifications.map((n) => (
              <div key={n.key} className="flex items-center justify-between gap-4 rounded-2xl border border-pastel-sky bg-pastel-sky-soft/50 p-3 transition-colors hover:bg-pastel-sky-soft">
                <div>
                  <Label htmlFor={`s-${n.key}`}>{n.label}</Label>
                  <p className="text-xs text-muted-foreground">{n.help}</p>
                </div>
                <Switch
                  id={`s-${n.key}`}
                  checked={form[n.key]}
                  onCheckedChange={(checked) => update(n.key, checked)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
              {saving ? "Guardando..." : "Guardar configuración"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
