"use client"

import { ShoppingBag, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CartItemRow, type CartItem } from "./cart-item"
import { PaymentSelector } from "./payment-selector"

type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | null

interface CartPanelProps {
  items: CartItem[]
  paymentMethod: PaymentMethod
  onUpdateQuantity: (index: number, delta: number) => void
  onRemoveItem: (index: number) => void
  onPaymentMethodChange: (method: PaymentMethod) => void
  onFinalizeSale: () => void
  isProcessing?: boolean
}

export function CartPanel({
  items,
  paymentMethod,
  onUpdateQuantity,
  onRemoveItem,
  onPaymentMethodChange,
  onFinalizeSale,
  isProcessing = false,
}: CartPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = 0 // 0% impuesto
  const total = subtotal + tax

  const canFinalize = items.length > 0 && paymentMethod !== null

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
          <Receipt className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Ticket de Venta</h2>
          <p className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "artículo" : "artículos"}
          </p>
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 px-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <ShoppingBag className="size-12 mb-2 opacity-50" />
            <p className="font-medium">Carrito vacío</p>
            <p className="text-sm">Selecciona productos para agregar</p>
          </div>
        ) : (
          <div className="py-2">
            {items.map((item, index) => (
              <CartItemRow
                key={`${item.product.id}-${item.selectedSize}`}
                item={item}
                index={index}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-4">
        {/* Payment Method */}
        <PaymentSelector
          selected={paymentMethod}
          onSelect={onPaymentMethodChange}
        />

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">
              ${subtotal.toLocaleString("es-CO")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Impuestos (0%)</span>
            <span className="font-medium tabular-nums">
              ${tax.toLocaleString("es-CO")}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-foreground">TOTAL A PAGAR</span>
            <span className="text-2xl font-bold text-primary tabular-nums">
              ${total.toLocaleString("es-CO")}
            </span>
          </div>
        </div>

        {/* Finalize Button */}
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold"
          disabled={!canFinalize || isProcessing}
          onClick={onFinalizeSale}
        >
          {isProcessing ? 'Procesando...' : 'Finalizar Venta'}
        </Button>
        {!paymentMethod && items.length > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Selecciona un método de pago para continuar
          </p>
        )}
      </div>
    </div>
  )
}
