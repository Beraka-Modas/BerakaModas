"use client"

import { useState, useCallback, useEffect } from 'react'
import { SearchBar } from '@/components/pos/search-bar'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartPanel } from '@/components/pos/cart-panel'
import { SizeSelectorModal } from '@/components/pos/size-selector-modal'
import { productService, inventoryService, salesService, branchService, categoryService, getImageUrl, type CreateSaleRequest, type StockDto, type Category, type Branch } from '@/lib/api'
import type { CartItem } from '@/components/pos/cart-item'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | null

export function POSPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Estados para el modal de selección de talla
  const [sizeModalOpen, setSizeModalOpen] = useState(false)
  const [selectedProductForSize, setSelectedProductForSize] = useState<any>(null)
  const [stockDetailForSize, setStockDetailForSize] = useState<StockDto[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Cargar categorías
        const [catsData, branchData] = await Promise.all([
          categoryService.getAll(),
          branchService.getAll()
        ])
        setCategories(catsData)
        setBranches(branchData)
        setSelectedBranchId(branchData[0]?.id ?? null)

        const data = await productService.getAll()

        // Adaptar los datos al formato esperado
        const adaptedProducts = data.map(p => ({
          ...p,
          id: p.id.toString(),
          imageUrl: getImageUrl(p.imageUrl),
          totalStock: 0 // Inicialmente 0
        }))

        // Cargar stock para cada producto en paralelo
        const productsWithStock = await Promise.all(
          adaptedProducts.map(async (product) => {
            try {
              const stocks = await inventoryService.getStockByProduct(Number(product.id))
              const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0)
              return { ...product, totalStock }
            } catch (error) {
              console.error(`Error cargando stock para producto ${product.id}:`, error)
              return product
            }
          })
        )

        setProducts(productsWithStock)
      } catch (error) {
        console.error('Error al cargar catálogo:', error)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])

  // Manejar clic en un producto: abrir modal de talla
  const handleSelectProduct = useCallback(async (product: any) => {
    setSelectedProductForSize(product)
    setSizeModalOpen(true)

    try {
      const stock = await inventoryService.getStockByProduct(Number(product.id))
      setStockDetailForSize(stock)
    } catch (error) {
      console.error('Error al obtener stock:', error)
      // Mostrar error en el modal
      setStockDetailForSize([])
    }
  }, [])

  // Manejar selección de talla en el modal
  const handleSizeSelected = useCallback((selectedSize: string, branchId: number, branchName: string) => {
    if (selectedProductForSize) {
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.product.id === selectedProductForSize.id && item.selectedSize === selectedSize && item.selectedBranchId === branchId
        )
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex].quantity += 1
          return updated
        }
        return [...prev, {
          product: selectedProductForSize,
          quantity: 1,
          selectedSize: selectedSize,
          selectedBranchId: branchId,
          selectedBranchName: branchName
        }]
      })
    }
  }, [selectedProductForSize])

  const handleUpdateQuantity = useCallback((index: number, delta: number) => {
    setCart((prev) => {
      const newCart = [...prev]
      const currentQuantity = newCart[index].quantity
      const newQuantity = Math.max(1, currentQuantity + delta)
      newCart[index] = {
        ...newCart[index],
        quantity: newQuantity
      }
      return newCart
    })
  }, [])

  const handleRemoveItem = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleFinalizeSale = async () => {
    if (!paymentMethod || cart.length === 0) return

    // Validar que todos los items del carrito sean de la misma sede
    const uniqueBranches = new Set(cart.map(item => item.selectedBranchId))
    if (uniqueBranches.size > 1) {
      toast.error('Todos los productos deben ser de la misma sede para completar la venta')
      return
    }

    const branchId = cart[0].selectedBranchId

    setIsProcessing(true)
    try {
      const saleRequest: CreateSaleRequest = {
        branchId: branchId,
        paymentMethod,
        items: cart.map((item) => ({
          productId: Number(String(item.product.id)),
          size: item.selectedSize || 'M',
          quantity: item.quantity,
          unitPrice: item.product.price
        }))
      }

      const result = await salesService.create(saleRequest)

      setCart([])
      setPaymentMethod(null)
      toast.success(`Venta completada con éxito. Ticket #${result.saleId}`)

    } catch (error: any) {
      console.error('Error al procesar venta:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Error de conexión con el servidor')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        <section className="flex-1 lg:w-3/5 flex flex-col p-4 lg:p-6 overflow-hidden min-h-0">
          <div className="mb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-1">Nueva Venta</h1>
            <p className="text-muted-foreground text-sm">Selecciona productos para agregar al carrito</p>
          </div>

          <div className="mb-4">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>

          {/* Filtro por categoría */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 min-h-0">
            {isLoadingProducts ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Cargando catálogo...</p>
              </div>
            ) : (
              <ProductGrid
                products={products}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onSelectProduct={handleSelectProduct}
              />
            )}
          </div>
        </section>

        <aside className="shrink-0 lg:w-2/5 xl:w-[420px] p-4 lg:p-6 lg:pl-0 max-h-[50vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
          <div className="h-full lg:h-full">
            <CartPanel
              items={cart}
              paymentMethod={paymentMethod}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onPaymentMethodChange={setPaymentMethod}
              onFinalizeSale={handleFinalizeSale}
              isProcessing={isProcessing}
            />
          </div>
        </aside>
      </div>

      {/* Modal para seleccionar talla */}
      <SizeSelectorModal
        isOpen={sizeModalOpen}
        product={selectedProductForSize}
        stockDetails={stockDetailForSize}
        branches={branches}
        onSelect={handleSizeSelected}
        onClose={() => {
          setSizeModalOpen(false)
          setSelectedProductForSize(null)
          setStockDetailForSize([])
        }}
      />
    </>
  )
}