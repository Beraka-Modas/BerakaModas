"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Upload } from 'lucide-react'
import { productService, categoryService, type Category, type CreateProductRequest } from '@/lib/api'

export function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    minStock: '5'
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Cargar Categorías reales desde Spring Boot
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAll()
        setCategories(data)
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Enviar el Producto al Backend
  // Enviar el Producto al Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.categoryId) {
      alert('Por favor, selecciona una categoría.')
      return
    }

    setIsSubmitting(true)

    try {
      // Crear FormData para enviar archivo + datos
      const requestFormData = new FormData()
      requestFormData.append('name', formData.name)
      requestFormData.append('description', formData.description)
      requestFormData.append('price', formData.price)
      requestFormData.append('categoryId', formData.categoryId)
      requestFormData.append('minStock', formData.minStock)

      // Añadir imagen si existe
      if (imageFile) {
        requestFormData.append('image', imageFile)
      }

      const result = await productService.createWithImage(requestFormData)

      // RF-01: Mostramos el SKU generado por el Backend!
      alert(`✅ ¡Producto creado exitosamente!\nTu SKU autogenerado es: ${result.sku}`)

      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        minStock: '5'
      })
      setImagePreview(null)
      setImageFile(null)

    } catch (error: any) {
      console.error('Error creando producto:', error)
      if (error.response?.data?.message) {
        alert(`❌ Error: ${error.response.data.message}`)
      } else {
        alert('❌ Ocurrió un error al guardar el producto.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Nuevo Producto</h1>
          <p className="text-muted-foreground text-sm">
            Crea una nueva ficha técnica de producto
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Ficha Técnica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">

                {/* Columna Izquierda */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Nombre del Producto <span className="text-destructive">*</span>
                    </label>
                    <Input
                        type="text"
                        placeholder="Ej: Blusa Rosa Satinada"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Descripción
                    </label>
                    <textarea
                        placeholder="Descripción detallada del producto..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Precio <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                          type="number"
                          min="0"
                          step="100"
                          placeholder="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                          className="h-11 pl-7"
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Categoría <span className="text-destructive">*</span>
                    </label>
                    {isLoadingCategories ? (
                        <div className="h-11 flex items-center justify-center border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            required
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Seleccionar categoría</option>
                          {categories.map((cat) => (
                              <option key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </option>
                          ))}
                        </select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Stock Mínimo
                    </label>
                    <Input
                        type="number"
                        min="0"
                        placeholder="5"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Alerta cuando el stock sea menor a esta cantidad
                    </p>
                  </div>
                </div>
              </div>

              {/* Subir Imagen */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Imagen del Producto (Opcional)
                </label>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleImageDrop}
                    className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                      <div className="flex items-center gap-4">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">Imagen cargada</p>
                          <p className="text-xs text-muted-foreground">
                            Arrastra otra imagen para reemplazar
                          </p>
                        </div>
                      </div>
                  ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          Arrastra una imagen aquí
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          o haz clic para seleccionar un archivo
                        </p>
                      </div>
                  )}
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                  ) : (
                      'Guardar Producto'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
  )
}