import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export type FormErrors = Record<string, string>

/** Muestra los errores de validación de un formulario. */
export function ErrorAlert({ errors }: { errors: FormErrors }) {
  const messages = Object.values(errors)
  if (messages.length === 0) return null
  return (
    <Alert variant="destructive" className="animate-pop-in rounded-2xl border-destructive/30 bg-pastel-pink-soft/70">
      <AlertCircleIcon />
      <AlertTitle>Revisa los campos del formulario</AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-0.5 pl-4">
          {messages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

export function SuccessAlert({ title, description }: { title: string; description?: string }) {
  return (
    <Alert className="animate-pop-in rounded-2xl border-pastel-mint bg-pastel-mint-soft text-pastel-mint-ink *:data-[slot=alert-description]:text-pastel-mint-ink/90">
      <CheckCircle2Icon />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
