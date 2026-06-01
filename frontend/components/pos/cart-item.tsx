"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "./product-card"

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedBranchId: number
  selectedBranchName: string
}

interface CartItemRowProps {
  item: CartItem
  index: number
  onUpdateQuantity: (index: number, delta: number) => void
  onRemove: (index: number) => void
}

export function CartItemRow({ item, index, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const subtotal = item.product.price * item.quantity

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground line-clamp-1">
          {item.product.name}
        </h4>
        <p className="text-xs text-muted-foreground">
          Talla: {item.selectedSize} · Sede: {item.selectedBranchName} · ${item.product.price.toLocaleString("es-CO")} c/u
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onUpdateQuantity(index, -1)}
          disabled={item.quantity <= 1}
          className="size-7"
        >
          <Minus className="size-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium tabular-nums">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onUpdateQuantity(index, 1)}
          className="size-7"
        >
          <Plus className="size-3" />
        </Button>
      </div>

      {/* Subtotal */}
      <div className="w-20 text-right">
        <p className="font-semibold text-sm tabular-nums">
          ${subtotal.toLocaleString("es-CO")}
        </p>
      </div>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="text-muted-foreground hover:text-destructive size-7"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}
