"use client"

import { cn } from "@/lib/utils"
import { Banknote, CreditCard, ArrowRightLeft } from "lucide-react"

type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | null

interface PaymentSelectorProps {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

const paymentMethods = [
  { id: "efectivo" as const, label: "Efectivo", icon: Banknote },
  { id: "tarjeta" as const, label: "Tarjeta", icon: CreditCard },
  { id: "transferencia" as const, label: "Transferencia", icon: ArrowRightLeft },
]

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        Método de Pago
      </label>
      <div className="grid grid-cols-3 gap-2">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selected === method.id
          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
              )}
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium">{method.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
