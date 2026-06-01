"use client"

import { ProductCard, type Product } from "./product-card"

interface ProductGridProps {
  products: Product[]
  searchTerm: string
  selectedCategory: string | null
  onSelectProduct: (product: Product) => void
}

export function ProductGrid({ products, searchTerm, selectedCategory, onSelectProduct }: ProductGridProps) {
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = (
      (product.name || '').toLowerCase().includes(term) ||
      (product.sku || '').toLowerCase().includes(term) ||
      ((product.categoryName || '') as string).toLowerCase().includes(term)
    )
    const matchesCategory = !selectedCategory || (product.categoryName || '') === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-lg font-medium">No se encontraron productos</p>
        <p className="text-sm">Intenta con otro término de búsqueda o categoría</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onSelectProduct}
        />
      ))}
    </div>
  )
}
