"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, Plus, X, Package, Loader2, ChevronDown, ChevronUp, PencilLine, Trash2, Upload, RefreshCw, AlertTriangle } from 'lucide-react'
import { inventoryService, productService, branchService, categoryService, getImageUrl, type InventoryEntryRequest, type Product, type StockDto, type Category, type Branch } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null)
  const [stockDetailMap, setStockDetailMap] = useState<Record<number, StockDto[]>>({})
  const [loadingStockId, setLoadingStockId] = useState<number | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)

  // Cargar productos desde Spring Boot para la tabla
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const [data, branchData] = await Promise.all([productService.getAll(), branchService.getAll()])
        setBranches(branchData)

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

  const reloadInventory = async () => {
    setIsLoading(true)
    try {
      const data = await productService.getAll()
      const mappedInventory = data.map((p) => ({
        id: p.id,
        sku: p.sku,
        productName: p.name,
        categoryName: p.categoryName,
        categoryId: p.categoryId,
        minStock: p.minStock,
        description: p.description,
        price: p.price,
        imageUrl: getImageUrl(p.imageUrl)
      }))
      setInventory(mappedInventory)

      // Cargar stock para todos los productos en paralelo
      const stockMap: Record<number, StockDto[]> = {}
      await Promise.all(
        data.map(async (product) => {
          try {
            const stocks = await inventoryService.getStockByProduct(product.id)
            stockMap[product.id] = stocks
          } catch (error) {
            console.error(`Error cargando stock para producto ${product.id}:`, error)
            stockMap[product.id] = []
          }
        })
      )
      setStockDetailMap(stockMap)
      setExpandedProductId(null)
      toast.success('Inventario recargado correctamente')
    } catch (error) {
      console.error('Error al recargar inventario:', error)
      toast.error('Error al recargar inventario')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    const product = inventory.find((item) => item.id === productId)
    if (!product) return

    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      await productService.delete(productToDelete)
      await reloadInventory()
      toast.success('Producto eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar producto:', error)
      toast.error(error.response?.data?.message || 'No se pudo eliminar el producto')
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
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
        <div className="flex gap-2">
          <Button
            onClick={reloadInventory}
            variant="outline"
            size="icon"
            className="h-10 w-10"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ingresar Mercancía
          </Button>
        </div>
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-12"></th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-24">Imagen</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Prenda</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Stock Total</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Umbral Min.</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                   {filteredInventory.length === 0 ? (
                     <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
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
                             <td className="py-3 px-4">
                               <div className="relative w-20 h-20">
                                 <Image
                                   src={item.imageUrl}
                                   alt={item.productName}
                                   fill
                                    priority={expandedProductId === item.id}
                                    loading={expandedProductId === item.id ? 'eager' : 'lazy'}
                                   className="object-cover rounded-md"
                                    sizes="80px"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement
                                      img.src = '/placeholder.jpg'
                                    }}
                                 />
                               </div>
                             </td>
                             <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{item.sku}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-foreground">{item.productName}</div>
                              <div className="text-xs text-muted-foreground">{item.categoryName}</div>
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-lg">{totalStock}</td>
                            <td className="py-3 px-4 text-center font-semibold">{item.minStock}</td>
                            <td className="py-3 px-4 text-center">{getStatusBadge(status)}</td>
                             <td className="py-3 px-4 text-center">
                               <div className="flex items-center justify-center gap-2">
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="icon"
                                   className="h-8 w-8"
                                   onClick={() => {
                                     setSelectedProduct(item)
                                     setIsEditModalOpen(true)
                                   }}
                                 >
                                   <PencilLine className="h-4 w-4" />
                                 </Button>
                                 <Button
                                   type="button"
                                   variant="destructive"
                                   size="icon"
                                   className="h-8 w-8"
                                   onClick={() => handleDeleteProduct(item.id)}
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </div>
                             </td>
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
                             <td colSpan={7} className="py-4 px-4">
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
            reloadInventory()
            toast.success('¡Inventario abastecido correctamente!')
          }}
        />
      )}

      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedProduct(null)
          }}
          onSuccess={async () => {
            setIsEditModalOpen(false)
            setSelectedProduct(null)
            await reloadInventory()
            toast.success('Producto actualizado correctamente')
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// --- MODAL COMPONENT ---
function InventoryEntryModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [entries, setEntries] = useState<Array<{ size: string; quantity: number }>>([
    { size: '', quantity: 0 }
  ])

  useEffect(() => {
    Promise.all([productService.getAll(), branchService.getAll()])
      .then(([productsData, branchesData]) => {
        setProducts(productsData)
        setBranches(branchesData)
        setSelectedBranchId(branchesData[0]?.id.toString() || '')
      })
      .catch(console.error)
  }, [])

  const addEntry = () => {
    setEntries([...entries, { size: '', quantity: 0 }])
  }

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index))
    }
  }

  const updateEntry = (index: number, field: 'size' | 'quantity', value: any) => {
    const updated = [...entries]
    if (field === 'quantity') {
      updated[index].quantity = parseInt(value) || 0
    } else {
      updated[index].size = value
    }
    setEntries(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que hay producto, sede y al menos una talla con cantidad
    if (!selectedProductId || !selectedBranchId) {
      toast.error('Debes seleccionar producto y sede')
      return
    }

    const validEntries = entries.filter(e => e.size && e.quantity > 0)
    if (validEntries.length === 0) {
      toast.error('Debes añadir al menos una talla con cantidad mayor a 0')
      return
    }

    setIsSubmitting(true)

    try {
      // Enviar cada talla como un ingreso separado
      await Promise.all(
        validEntries.map(entry =>
          inventoryService.addEntry({
            productId: parseInt(selectedProductId),
            branchId: parseInt(selectedBranchId),
            size: entry.size,
            quantity: entry.quantity
          })
        )
      )
      onSuccess()
    } catch (error: any) {
      console.error('Error al registrar las entradas:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Error al comunicarse con el servidor')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sticky top-0 bg-background">
          <CardTitle className="text-lg">Ingresar Mercancía (Abastecer)</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Producto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">-- Elige una prenda --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id.toString()}>{p.sku} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sede Destino</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id.toString()}>{branch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Ingreso por Talla</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEntry}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" /> Añadir Talla
                </Button>
              </div>

              {entries.map((entry, index) => (
                <div key={index} className="flex gap-2 items-end bg-muted/30 p-3 rounded-lg">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">Talla</label>
                    <select
                      value={entry.size}
                      onChange={(e) => updateEntry(index, 'size', e.target.value)}
                      required
                      className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
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
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">Cantidad</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={entry.quantity || ''}
                      onChange={(e) => updateEntry(index, 'quantity', e.target.value)}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  {entries.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
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

function EditProductModal({
  product,
  onClose,
  onSuccess,
}: {
  product: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: product.productName || '',
    description: product.description || '',
    price: String(product.price ?? ''),
    categoryId: String(product.categoryId ?? ''),
    minStock: String(product.minStock ?? 0)
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl || null)

  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setIsLoadingCategories(false))
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.categoryId) {
        throw new Error('Selecciona una categoría')
      }

      if (imageFile) {
        const payload = new FormData()
        payload.append('name', formData.name)
        payload.append('description', formData.description)
        payload.append('price', formData.price)
        payload.append('categoryId', formData.categoryId)
        payload.append('minStock', formData.minStock)
        payload.append('image', imageFile)
        await productService.updateWithImage(product.id, payload)
      } else {
        await productService.update(product.id, {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          categoryId: Number(formData.categoryId),
          minStock: Number(formData.minStock),
        })
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error al actualizar producto:', error)
      toast.error(error.response?.data?.message || error.message || 'No se pudo actualizar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sticky top-0 bg-background">
          <CardTitle className="text-lg">Editar Producto</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nombre</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Precio</label>
                  <Input type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Categoría</label>
                  {isLoadingCategories ? (
                    <div className="h-11 flex items-center justify-center border rounded-md"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                  ) : (
                    <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Seleccionar categoría</option>
                      {categories.map((cat) => <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Stock mínimo</label>
                  <Input type="number" min="0" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Imagen nueva (opcional)</label>
                  <div className="relative border-2 border-dashed border-border rounded-lg p-4">
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {imagePreview ? (
                      <div className="flex items-center gap-4">
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                        <div className="text-sm text-muted-foreground">Haz clic o arrastra para cambiar la imagen</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                        <Upload className="h-5 w-5 mb-2" />
                        <span className="text-sm">Subir imagen nueva</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
