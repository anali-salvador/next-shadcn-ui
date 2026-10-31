import { Cloud, Heart, Sparkle, Sparkles, Star, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type PastelTone = "pink" | "lilac" | "sky" | "mint" | "peach"

const toneClasses: Record<PastelTone, string> = {
  pink: "bg-pastel-pink-soft text-pastel-pink-ink ring-pastel-pink",
  lilac: "bg-pastel-lilac-soft text-pastel-lilac-ink ring-pastel-lilac",
  sky: "bg-pastel-sky-soft text-pastel-sky-ink ring-pastel-sky",
  mint: "bg-pastel-mint-soft text-pastel-mint-ink ring-pastel-mint",
  peach: "bg-pastel-peach-soft text-pastel-peach-ink ring-pastel-peach",
}

const barClasses: Record<PastelTone, string> = {
  pink: "from-pastel-pink to-pastel-lilac",
  lilac: "from-pastel-lilac to-pastel-sky",
  sky: "from-pastel-sky to-pastel-mint",
  mint: "from-pastel-mint to-pastel-sky",
  peach: "from-pastel-peach to-pastel-pink",
}

/** Icono dentro de una burbuja pastel redondeada. */
export function IconBubble({
  icon: Icon,
  tone = "pink",
  className,
}: {
  icon: LucideIcon
  tone?: PastelTone
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-2xl ring-1",
        toneClasses[tone],
        className
      )}
    >
      <Icon className="size-4.5" strokeWidth={2.25} />
    </span>
  )
}

/** Barra de progreso redondeada con degradado pastel. */
export function ProgressBar({
  value,
  tone,
  className,
}: {
  value: number
  tone?: PastelTone
  className?: string
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted ring-1 ring-pastel-pink/40", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          tone ? cn("bg-linear-to-r", barClasses[tone]) : "kawaii-progress"
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

type Deco = {
  icon: LucideIcon
  className: string
  anim: string
  delay: string
  fill?: boolean
}

// Posiciones en los bordes para no quedar detrás del contenido principal.
const decorations: Deco[] = [
  { icon: Star, className: "top-[8%] left-[3%] size-7 text-pastel-peach", anim: "animate-float", delay: "0s", fill: true },
  { icon: Heart, className: "top-[18%] right-[4%] size-8 text-pastel-pink", anim: "animate-float-slow", delay: "1.2s", fill: true },
  { icon: Cloud, className: "top-[42%] left-[1.5%] size-12 text-pastel-sky", anim: "animate-float-slow", delay: "0.6s", fill: true },
  { icon: Sparkles, className: "top-[55%] right-[2%] size-7 text-pastel-lilac", anim: "animate-twinkle", delay: "0.3s" },
  { icon: Sparkle, className: "top-[6%] left-[46%] size-5 text-pastel-pink", anim: "animate-twinkle", delay: "1.6s", fill: true },
  { icon: Heart, className: "bottom-[10%] left-[5%] size-6 text-pastel-lilac", anim: "animate-float", delay: "2s", fill: true },
  { icon: Star, className: "bottom-[16%] right-[7%] size-6 text-pastel-mint", anim: "animate-float", delay: "0.9s", fill: true },
  { icon: Cloud, className: "bottom-[4%] right-[28%] size-14 text-pastel-pink-soft", anim: "animate-float-slow", delay: "2.4s", fill: true },
  { icon: Sparkles, className: "top-[30%] left-[22%] size-5 text-pastel-peach", anim: "animate-twinkle", delay: "2.2s" },
  { icon: Star, className: "top-[75%] left-[40%] size-4 text-pastel-sky", anim: "animate-twinkle", delay: "1s", fill: true },
]

/**
 * Fondo animado: degradado pastel que se desplaza, manchas suaves que se mueven
 * y pequeños iconos flotando. Va fijo detrás del contenido y no recibe clics.
 */
export function KawaiiBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="kawaii-gradient animate-gradient absolute inset-0 opacity-90" />

      <div className="animate-blob absolute -top-24 -left-24 size-80 rounded-full bg-pastel-pink opacity-40 blur-3xl sm:size-112" />
      <div
        className="animate-blob absolute top-1/3 -right-32 size-72 rounded-full bg-pastel-sky opacity-40 blur-3xl sm:size-104"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="animate-blob absolute -bottom-32 left-1/4 size-80 rounded-full bg-pastel-mint opacity-35 blur-3xl sm:size-112"
        style={{ animationDelay: "-14s" }}
      />
      <div
        className="animate-blob absolute top-[12%] left-1/2 hidden size-64 rounded-full bg-pastel-lilac opacity-30 blur-3xl md:block"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="animate-blob absolute bottom-[20%] -left-20 hidden size-60 rounded-full bg-pastel-peach opacity-35 blur-3xl md:block"
        style={{ animationDelay: "-10s" }}
      />

      {decorations.map(({ icon: Icon, className, anim, delay, fill }, i) => (
        <Icon
          key={i}
          className={cn("absolute opacity-70", i % 2 === 1 && "hidden sm:block", anim, className)}
          style={{ animationDelay: delay }}
          fill={fill ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}
