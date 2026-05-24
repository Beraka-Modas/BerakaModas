"use client"

import { useState, useCallback, useEffect } from 'react'
import { SearchBar } from '@/components/pos/search-bar'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartPanel } from '@/components/pos/cart-panel'
import { SizeSelectorModal } from '@/components/pos/size-selector-modal'
import { productService, inventoryService, salesService, getImageUrl, type CreateSaleRequest, type StockDto } from '@/lib/api'
import type { CartItem } from '@/components/pos/cart-item'
import { Loader2 } from 'lucide-react'

type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | null

export function POSPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)

  const [products, setProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Estados para el modal de selección de talla
  const [sizeModalOpen, setSizeModalOpen] = useState(false)
  const [selectedProductForSize, setSelectedProductForSize] = useState<any>(null)
  const [stockDetailForSize, setStockDetailForSize] = useState<StockDto[]>([])
  const [isLoadingStock, setIsLoadingStock] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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
    setIsLoadingStock(true)
    setSizeModalOpen(true)

    try {
      const stock = await inventoryService.getStockByProduct(Number(product.id))
      setStockDetailForSize(stock)
    } catch (error) {
      console.error('Error al obtener stock:', error)
      // Mostrar error en el modal
      setStockDetailForSize([])
    } finally {
      setIsLoadingStock(false)
    }
  }, [])

  // Manejar selección de talla en el modal
  const handleSizeSelected = useCallback((selectedSize: string) => {
    if (selectedProductForSize) {
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.product.id === selectedProductForSize.id && item.selectedSize === selectedSize
        )
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex].quantity += 1
          return updated
        }
        return [...prev, {
          product: selectedProductForSize,
          quantity: 1,
          selectedSize: selectedSize
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

    setIsProcessing(true)
    try {
      const saleRequest: CreateSaleRequest = {
        branchId: 1,
        paymentMethod,
        items: cart.map((item) => ({
          productId: parseInt(item.product.id),
          size: item.selectedSize || 'M',
          quantity: item.quantity,
          unitPrice: item.product.price
        }))
      }

      const result = await salesService.create(saleRequest)

      setCart([])
      setPaymentMethod(null)
      alert(`¡Venta completada con éxito!\nTotal cobrado: $${result.total.toLocaleString('es-CO')}\nTicket #${result.saleId}`)

    } catch (error: any) {
      console.error('Error al procesar venta:', error)
      if (error.response?.data?.message) {
        alert(`❌ Error: ${error.response.data.message}`)
      } else {
        alert('❌ Error de conexión con el servidor')
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