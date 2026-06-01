"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { StockDto, Branch } from '@/lib/api'
import type { Product } from './product-card'

interface SizeSelectorModalProps {
  isOpen: boolean
  product: Product | null
  stockDetails: StockDto[]
  branches: Branch[]
  onSelect: (size: string, branchId: number, branchName: string) => void
  onClose: () => void
}

export function SizeSelectorModal({
  isOpen,
  product,
  stockDetails,
  branches,
  onSelect,
  onClose
}: SizeSelectorModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null)

  const handleConfirm = () => {
    if (selectedSize && selectedBranchId && selectedBranchName) {
      onSelect(selectedSize, selectedBranchId, selectedBranchName)
      setSelectedSize(null)
      setSelectedBranchId(null)
      setSelectedBranchName(null)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedSize(null)
    setSelectedBranchId(null)
    setSelectedBranchName(null)
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
                  <p className="text-sm font-medium">Selecciona la sede:</p>
                  {sizeGroups[selectedSize]?.filter(s => s.quantity > 0).map((stock) => {
                    const branch = branches.find(b => b.name === stock.branchName)
                    const branchId = branch?.id
                    return (
                      <button
                        key={`${stock.size}-${stock.branchName}`}
                        onClick={() => {
                          if (branchId) {
                            setSelectedBranchId(branchId)
                            setSelectedBranchName(stock.branchName)
                          }
                        }}
                        disabled={!branchId}
                        className={cn(
                          "w-full flex justify-between items-center p-2 rounded border-2 transition-colors",
                          selectedBranchId === branchId
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50",
                          !branchId && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span className="text-sm">{stock.branchName}</span>
                        <Badge variant={selectedBranchId === branchId ? "default" : "secondary"}>
                          {stock.quantity} {stock.quantity === 1 ? 'und' : 'unds'}
                        </Badge>
                      </button>
                    )
                  })}
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
            disabled={!selectedSize || !selectedBranchId}
            className="bg-primary hover:bg-primary/90"
          >
            Agregar al Carrito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

