"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Upload, AlertTriangle } from 'lucide-react'
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
import { productService, categoryService, branchService, type Category, type Branch, type CreateProductRequest } from '@/lib/api'
import { toast } from 'sonner'

export function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const [isSavingBranch, setIsSavingBranch] = useState(false)
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', description: '' })
  const [branchForm, setBranchForm] = useState({ name: '', address: '', internalId: '' })
  const [branches, setBranches] = useState<Branch[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    minStock: '5'
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)

  // Cargar Categorías reales desde Spring Boot
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [categoriesData, branchesData] = await Promise.all([categoryService.getAll(), branchService.getAll()])
        setCategories(categoriesData)
        setBranches(branchesData)
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

  const reloadCategories = async () => {
    const data = await categoryService.getAll()
    setCategories(data)
  }

  const reloadBranches = async () => {
    const data = await branchService.getAll()
    setBranches(data)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryForm.name.trim()) return

    setIsSavingCategory(true)
    try {
      if (categoryForm.id) {
        await categoryService.update(Number(categoryForm.id), {
          name: categoryForm.name,
          description: categoryForm.description,
        })
        toast.success('Categoría actualizada correctamente')
      } else {
        await categoryService.create({
          name: categoryForm.name,
          description: categoryForm.description,
        })
        toast.success('Categoría creada correctamente')
      }

      setCategoryForm({ id: '', name: '', description: '' })
      await reloadCategories()
    } catch (error: any) {
      console.error('Error guardando categoría:', error)
      toast.error(error.response?.data?.message || error.message || 'No se pudo guardar la categoría')
    } finally {
      setIsSavingCategory(false)
    }
  }

  const handleCategoryEdit = (category: Category) => {
    setCategoryForm({
      id: String(category.id),
      name: category.name,
      description: category.description || ''
    })
  }

  const handleCategoryDelete = async (categoryId: number) => {
    setCategoryToDelete(categoryId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      await categoryService.delete(categoryToDelete)
      await reloadCategories()
      toast.success('Categoría eliminada correctamente')
    } catch (error: any) {
      console.error('Error eliminando categoría:', error)
      toast.error(error.response?.data?.message || error.message || 'No se pudo eliminar la categoría')
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchForm.name.trim() || !branchForm.address.trim() || !branchForm.internalId.trim()) return

    setIsSavingBranch(true)
    try {
      await branchService.create({
        name: branchForm.name,
        address: branchForm.address,
        internalId: branchForm.internalId,
      })
      toast.success('Sede creada correctamente')
      setBranchForm({ name: '', address: '', internalId: '' })
      await reloadBranches()
    } catch (error: any) {
      console.error('Error guardando sede:', error)
      toast.error(error.response?.data?.message || error.message || 'No se pudo guardar la sede')
    } finally {
      setIsSavingBranch(false)
    }
  }

  // Enviar el Producto al Backend
  // Enviar el Producto al Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.categoryId) {
      toast.error('Por favor, selecciona una categoría.')
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
      toast.success(`¡Producto creado exitosamente! SKU: ${result.sku}`)

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
        toast.error(error.response.data.message)
      } else {
        toast.error('Ocurrió un error al guardar el producto.')
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

        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Administrar Categorías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleCategorySubmit} className="grid md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nombre</label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ej: Blusas"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <Input
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Descripción de la categoría"
                />
              </div>
              <div className="flex gap-2 md:col-span-3">
                <Button type="submit" disabled={isSavingCategory}>
                  {isSavingCategory ? 'Guardando...' : categoryForm.id ? 'Actualizar Categoría' : 'Crear Categoría'}
                </Button>
                {categoryForm.id && (
                  <Button type="button" variant="outline" onClick={() => setCategoryForm({ id: '', name: '', description: '' })}>
                    Cancelar edición
                  </Button>
                )}
              </div>
            </form>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-3 bg-muted/20 space-y-2">
                  <div>
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.description || 'Sin descripción'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleCategoryEdit(category)}>
                      Editar
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => handleCategoryDelete(category.id)}>
                      Borrar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Administrar Sedes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleBranchSubmit} className="grid md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nombre</label>
                <Input value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} placeholder="Ej: Sucursal Norte" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Dirección</label>
                <Input value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} placeholder="Dirección de la sede" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ID Interno</label>
                <Input value={branchForm.internalId} onChange={(e) => setBranchForm({ ...branchForm, internalId: e.target.value })} placeholder="Ej: 3" required />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={isSavingBranch}>{isSavingBranch ? 'Guardando...' : 'Crear Sede'}</Button>
              </div>
            </form>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {branches.map((branch) => (
                <div key={branch.id} className="border rounded-lg p-3 bg-muted/20 space-y-1">
                  <p className="font-medium text-foreground">{branch.name}</p>
                  <p className="text-xs text-muted-foreground">{branch.address}</p>
                  <p className="text-xs text-muted-foreground">ID interno: {branch.internalId}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
  )
}