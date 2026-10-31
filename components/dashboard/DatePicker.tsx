"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  id?: string
  value: string // yyyy-MM-dd o ""
  onChange: (value: string) => void
  placeholder?: string
  /** Muestra selectores de mes/año (útil para fechas de nacimiento). */
  withDropdowns?: boolean
  fromYear?: number
  toYear?: number
  invalid?: boolean
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  withDropdowns = false,
  fromYear = 1950,
  toYear = 2035,
  invalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? parseISO(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={invalid || undefined}
            className={cn("w-full justify-start font-normal", !selected && "text-muted-foreground")}
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        {selected ? format(selected, "PPP", { locale: es }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          selected={selected}
          defaultMonth={selected}
          captionLayout={withDropdowns ? "dropdown" : "label"}
          startMonth={new Date(fromYear, 0)}
          endMonth={new Date(toYear, 11)}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function formatDate(value: string) {
  return value ? format(parseISO(value), "dd/MM/yyyy") : "—"
}
