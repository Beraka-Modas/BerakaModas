"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { StockDto } from '@/lib/api'
import type { Product } from './product-card'

interface SizeSelectorModalProps {
  isOpen: boolean
  product: Product | null
  stockDetails: StockDto[]
  onSelect: (size: string) => void
  onClose: () => void
}

export function SizeSelectorModal({
  isOpen,
  product,
  stockDetails,
  onSelect,
  onClose
}: SizeSelectorModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const handleConfirm = () => {
    if (selectedSize) {
      onSelect(selectedSize)
      setSelectedSize(null)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedSize(null)
    onClose()
  }

  // Agrupar stock por talla
  const sizeGroups = stockDetails.reduce((acc, stock) => {
    if (!acc[stock.size]) {
      acc[stock.size] = []
    }
    acc[stock.size].push(stock)
    return acc
  }, {} as Record<string, StockDto[]>)

  const availableSizes = Object.keys(sizeGroups).filter(
    (size) => sizeGroups[size].some(s => s.quantity > 0)
  )

  const getTotalForSize = (size: string): number => {
    return sizeGroups[size]?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Talla</DialogTitle>
          <DialogDescription>
            {product?.name} - Elige la talla disponible
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableSizes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay stock disponible para este producto</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Tallas disponibles:</p>
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map((size) => {
                  const total = getTotalForSize(size)
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-colors text-center",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border text-foreground hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium">{size}</div>
                      <div className="text-xs text-muted-foreground">
                        {total} {total === 1 ? 'und' : 'unds'}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Mostrar desglose por sede para la talla seleccionada */}
              {selectedSize && (
                <div className="mt-4 p-3 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-sm font-medium">Stock disponible por sede:</p>
                  {sizeGroups[selectedSize]?.map((stock) => (
                    stock.quantity > 0 && (
                      <div key={`${stock.size}-${stock.branchName}`} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{stock.branchName}</span>
                        <Badge variant="secondary">{stock.quantity}</Badge>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSize}
            className="bg-primary hover:bg-primary/90"
          >
            Agregar al Carrito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

