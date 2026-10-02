"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type AppSelectOption = { value: string; label: React.ReactNode; disabled?: boolean }

// Radix Select reserves "" for "no selection", so empty option values are mapped through this.
const EMPTY = "__app_select_empty__"
const toInner = (v: string) => (v === "" ? EMPTY : v)
const toOuter = (v: string) => (v === EMPTY ? "" : v)

/**
 * Styled replacement for a native <select>: same value/onChange(string) contract,
 * but the open list matches the app instead of the OS default.
 */
export function AppSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  contentClassName,
  id,
  disabled,
  "aria-label": ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: AppSelectOption[]
  placeholder?: string
  className?: string
  contentClassName?: string
  id?: string
  disabled?: boolean
  "aria-label"?: string
}) {
  return (
    <Select value={toInner(value)} onValueChange={(v) => onChange(toOuter(v))} disabled={disabled}>
      <SelectTrigger id={id} aria-label={ariaLabel} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn("max-h-72", contentClassName)}>
        {options.map((o) => (
          <SelectItem key={o.value} value={toInner(o.value)} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
