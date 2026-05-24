"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, X, Package, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { inventoryService, productService, getImageUrl, type InventoryEntryRequest, type Product, type StockDto } from '@/lib/api'
import { cn } from '@/lib/utils'

export function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null)
  const [stockDetailMap, setStockDetailMap] = useState<Record<number, StockDto[]>>({})
  const [loadingStockId, setLoadingStockId] = useState<number | null>(null)

  // Cargar productos desde Spring Boot para la tabla
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await productService.getAll()

         // Mapeamos los productos para que encajen en el diseño visual de la tabla
         const mappedInventory = data.map((p) => ({
           id: p.id,
           sku: p.sku,
           productName: p.name,
           categoryName: p.categoryName,
           minStock: p.minStock,
           description: p.description,
           price: p.price,
           imageUrl: getImageUrl(p.imageUrl)
         }))

        setInventory(mappedInventory)
      } catch (error) {
        console.error('Error al cargar inventario:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadInventory()
  }, [])

  const filteredInventory = inventory.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponible':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Disponible</Badge>
      case 'bajo':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Stock Bajo</Badge>
      case 'agotado':
        return <Badge variant="secondary" className="bg-red-100 text-red-700">Agotado</Badge>
      default:
        return null
    }
  }

  // Cargar detalles de stock para un producto (tallas y sedes)
  const toggleExpandProduct = async (productId: number) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null)
      return
    }

    if (!stockDetailMap[productId]) {
      setLoadingStockId(productId)
      try {
        const stocks = await inventoryService.getStockByProduct(productId)
        setStockDetailMap((prev) => ({ ...prev, [productId]: stocks }))
      } catch (error) {
        console.error('Error al cargar stock del producto:', error)
        setStockDetailMap((prev) => ({ ...prev, [productId]: [] }))
      } finally {
        setLoadingStockId(null)
      }
    }

    setExpandedProductId(productId)
  }

  // Agrupar stock por talla
  const groupBySize = (stocks: StockDto[]): Record<string, StockDto[]> => {
    return stocks.reduce((acc, stock) => {
      if (!acc[stock.size]) {
        acc[stock.size] = []
      }
      acc[stock.size].push(stock)
      return acc
    }, {} as Record<string, StockDto[]>)
  }

  // Calcular total de stock para un producto
  const getTotalStock = (productId: number): number => {
    const stocks = stockDetailMap[productId] || []
    return stocks.reduce((sum, stock) => sum + stock.quantity, 0)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario General</h1>
          <p className="text-muted-foreground text-sm">
            Catálogo de productos y abastecimiento
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ingresar Mercancía
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por SKU o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-8"></th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Prenda</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Stock Total</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Umbral Min.</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron productos</p>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {filteredInventory.map((item) => {
                        const isExpanded = expandedProductId === item.id
                        const stocks = stockDetailMap[item.id] || []
                        const totalStock = getTotalStock(item.id)
                        const status = totalStock === 0 ? 'agotado' : totalStock <= item.minStock ? 'bajo' : 'disponible'
                        const sizeGroups = groupBySize(stocks)

                        return (
                          <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="text-center py-3 px-4">
                              <button
                                onClick={() => toggleExpandProduct(item.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {loadingStockId === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{item.sku}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-foreground">{item.productName}</div>
                              <div className="text-xs text-muted-foreground">{item.categoryName}</div>
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-lg">{totalStock}</td>
                            <td className="py-3 px-4 text-center font-semibold">{item.minStock}</td>
                            <td className="py-3 px-4 text-center">{getStatusBadge(status)}</td>
                          </tr>
                        )
                      })}
                      {/* Filas de expansión: detalles por talla y sede */}
                      {filteredInventory.map((item) => {
                        const isExpanded = expandedProductId === item.id
                        if (!isExpanded) return null

                        const stocks = stockDetailMap[item.id] || []
                        const sizeGroups = groupBySize(stocks)

                        return (
                          <tr key={`${item.id}-detail`} className="border-b border-border bg-muted/20">
                            <td colSpan={6} className="py-4 px-4">
                              <div className="space-y-4">
                                {Object.keys(sizeGroups).length === 0 ? (
                                  <div className="text-center text-muted-foreground py-4">
                                    <p>Sin stock registrado</p>
                                  </div>
                                ) : (
                                  <div className="grid gap-4">
                                    {Object.entries(sizeGroups).map(([size, sizeStocks]) => {
                                      const sizeTotal = sizeStocks.reduce((sum, s) => sum + s.quantity, 0)
                                      return (
                                        <div key={size} className="bg-background rounded-lg p-3 border border-border">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-foreground">Talla: {size}</span>
                                            <Badge variant="outline">{sizeTotal} unidades</Badge>
                                          </div>
                                          <div className="space-y-2 text-sm">
                                            {sizeStocks.map((stock) => (
                                              <div
                                                key={`${stock.size}-${stock.branchName}`}
                                                className="flex justify-between items-center p-2 bg-muted/30 rounded"
                                              >
                                                <span className="text-muted-foreground">{stock.branchName}</span>
                                                <Badge
                                                  variant={stock.quantity === 0 ? 'destructive' : 'secondary'}
                                                >
                                                  {stock.quantity} {stock.quantity === 1 ? 'und' : 'unds'}
                                                </Badge>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <InventoryEntryModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            // Recargar inventario
            const loadInventory = async () => {
              const data = await productService.getAll()
              const mappedInventory = data.map((p) => ({
                id: p.id,
                sku: p.sku,
                productName: p.name,
                categoryName: p.categoryName,
                minStock: p.minStock,
                description: p.description,
                price: p.price
              }))
              setInventory(mappedInventory)
              // Limpiar el mapa de stock
              setStockDetailMap({})
              setExpandedProductId(null)
            }
            loadInventory()
            alert('¡Inventario abastecido correctamente!')
          }}
        />
      )}
    </div>
  )
}

// --- MODAL COMPONENT ---
function InventoryEntryModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    productId: '',
    branchId: '1',
    size: '',
    quantity: ''
  })

  useEffect(() => {
    productService.getAll().then(setProducts).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const entry: InventoryEntryRequest = {
        productId: parseInt(formData.productId),
        branchId: parseInt(formData.branchId),
        size: formData.size,
        quantity: parseInt(formData.quantity)
      }

      await inventoryService.addEntry(entry)
      onSuccess()
    } catch (error: any) {
      console.error('Error al registrar la entrada:', error)
      if (error.response?.data?.message) {
        alert(`❌ Error: ${error.response.data.message}`)
      } else {
        alert('❌ Error al comunicarse con el servidor')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Ingresar Mercancía (Abastecer)</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Seleccionar Producto</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">-- Elige una prenda --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id.toString()}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sede Destino</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="1">Sede Central (ID: 1)</option>
                  <option value="2">Sucursal Norte (ID: 2)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Talla Física</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="Unica">Talla Única</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cantidad que ingresa</label>
              <Input
                type="number"
                min="1"
                placeholder="Ej: 10 unidades"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Ingreso'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}