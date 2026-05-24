"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar prenda por SKU, nombre o categoría..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-12 pr-4 text-base bg-card border-border shadow-sm"
      />
    </div>
  )
}
