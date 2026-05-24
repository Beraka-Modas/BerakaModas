"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export interface Product {
  id: string | number
  sku?: string
  name: string
  price: number
  imageUrl?: string
  categoryName?: string
  // Stock resumido (si se proporciona)
  totalStock?: number
  // Información para el badge
  description?: string
}

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const imageUrl = getImageUrl(product.imageUrl)
  const totalStock = product.totalStock ?? 0
  const isLowStock = totalStock <= 2
  const isOutOfStock = totalStock === 0

  return (
    <button
      onClick={() => onSelect(product)}
      disabled={isOutOfStock}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl border border-border p-3 text-left",
        "transition-all duration-200 hover:shadow-md hover:border-primary/30",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        isOutOfStock && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square w-full rounded-lg bg-secondary/50 overflow-hidden mb-3">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback si la imagen no carga
            (e.target as HTMLImageElement).src = '/placeholder.jpg'
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 space-y-1">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
          {product.name}
        </h3>
        <p className="text-lg font-semibold text-foreground tabular-nums">
          ${Number(product.price).toLocaleString("es-CO")}
        </p>
      </div>

      {/* Stock Badge */}
      {typeof totalStock !== 'undefined' && (
        <Badge
          variant={isLowStock ? "destructive" : "secondary"}
          className={cn(
            "mt-2 text-xs",
            !isLowStock && "bg-secondary text-secondary-foreground"
          )}
        >
          {totalStock} {totalStock === 1 ? "und" : "unds"} disponible
        </Badge>
      )}
    </button>
  )
}
