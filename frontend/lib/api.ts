"use client"

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080'

// Función para convertir URLs relativas a absolutas del servidor
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '/placeholder.jpg'

  // Si ya es una URL absoluta, devolverla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // Si empieza con /, es relativa al servidor backend
  if (imageUrl.startsWith('/')) {
    return `${SERVER_BASE_URL}${imageUrl}`
  }

  // Por defecto
  return '/placeholder.jpg'
}

// Instancia de axios conectada a nuestro Spring Boot
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para inyectar el token JWT en cada petición
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Asegurarnos de que estamos en el navegador
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => Promise.reject(error)
)

// Interceptor para expulsar al usuario si el token expira (401 o 403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          window.location.href = '/'
        }
      }
      return Promise.reject(error)
    }
)

// ==================== AUTH ====================
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  role: string
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Petición real a nuestro Spring Boot
    const response = await api.post<LoginResponse>('/auth/login', credentials)

    // Guardamos el token en el navegador
    localStorage.setItem('authToken', response.data.token)

    const user = {
      username: response.data.username || credentials.username,
      role: response.data.role || 'ADMIN'
    }
    localStorage.setItem('user', JSON.stringify(user))

    return response.data
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken')
    }
    return false
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  }
}

// ==================== PRODUCTS ====================
export interface Product {
  id: number
  sku: string
  name: string
  description: string
  price: number
  categoryId: number
  categoryName: string
  minStock: number
  imageUrl: string
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  categoryId: number
  minStock: number
  imageUrl?: string
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products')
    return response.data
  },

  create: async (product: CreateProductRequest): Promise<Product> => {
    const response = await api.post<Product>('/products', product)
    return response.data
  },

  // Crear producto con imagen usando FormData
  createWithImage: async (formData: FormData): Promise<Product> => {
    const response = await api.post<Product>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Actualizar producto
  update: async (id: number, product: Partial<CreateProductRequest>): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, product)
    return response.data
  },

  // Actualizar producto con imagen
  updateWithImage: async (id: number, formData: FormData): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Eliminar producto
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`)
  }
}

// ==================== CATEGORIES ====================
export interface Category {
  id: number
  name: string
  description: string
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories')
    return response.data
  },

  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post<Category>('/categories', category)
    return response.data
  },

  update: async (id: number, category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, category)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`)
  }
}

// ==================== BRANCHES ====================
export interface Branch {
  id: number
  name: string
  description?: string
}

export const branchService = {
  getAll: async (): Promise<Branch[]> => {
    const response = await api.get<Branch[]>('/branches')
    return response.data
  },

  create: async (branch: Omit<Branch, 'id'>): Promise<Branch> => {
    const response = await api.post<Branch>('/branches', branch)
    return response.data
  },

  update: async (id: number, branch: Omit<Branch, 'id'>): Promise<Branch> => {
    const response = await api.put<Branch>(`/branches/${id}`, branch)
    return response.data
  }
}

// ==================== INVENTORY ====================
export interface InventoryEntryRequest {
  productId: number
  branchId: number
  size: string
  quantity: number
}

// Interfaz para la respuesta de nuestro backend al crear stock
export interface StockDto {
  id: number
  branchName: string
  size: string
  quantity: number
}

export const inventoryService = {
  // Nota: v0 intentará buscar todos los inventarios. Por ahora llamaremos a los productos
  // ya que nuestro backend está optimizado para buscar stock POR producto.
  getAllProductsForInventory: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products')
    return response.data
  },

  addEntry: async (entry: InventoryEntryRequest): Promise<StockDto> => {
    const response = await api.post<StockDto>('/inventory/entry', entry)
    return response.data
  },

  // Obtener stock detallado por producto (tallas y sedes)
  getStockByProduct: async (productId: number): Promise<StockDto[]> => {
    const response = await api.get<StockDto[]>(`/inventory/product/${productId}`)
    return response.data
  }
}

// ==================== SALES ====================
export interface SaleItem {
  productId: number
  size: string
  quantity: number
  unitPrice?: number // Opcional porque nuestro backend calcula el precio real
}

export interface CreateSaleRequest {
  branchId: number
  paymentMethod: string // 'Efectivo' | 'Tarjeta' | 'Transferencia'
  items: SaleItem[]
}

export interface SaleResponse {
  saleId: number
  total: number
  date: string
  paymentMethod: string
  status: string
  branchName: string
  sellerName: string
}

// Tipo extendido para guardar con los productos vendidos
export interface SaleWithProducts extends SaleResponse {
  items: SaleItem[]
}

export const salesService = {
  create: async (sale: CreateSaleRequest): Promise<SaleResponse> => {
    // Asegurarnos de que el paymentMethod vaya en mayúscula inicial para que coincida con nuestro Backend
    const formattedSale = {
      ...sale,
      paymentMethod: sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)
    }
    const response = await api.post<SaleResponse>('/sales', formattedSale)

    // Guardar la venta en localStorage para mostrar en reportes
    const saleWithProducts: SaleWithProducts = {
      ...response.data,
      items: sale.items,
      total: typeof response.data.total === 'string' ? parseFloat(response.data.total) : response.data.total
    }

    if (typeof window !== 'undefined') {
      const sales = JSON.parse(localStorage.getItem('dailySales') || '[]') as SaleWithProducts[]
      sales.push(saleWithProducts)
      localStorage.setItem('dailySales', JSON.stringify(sales))
    }

    return response.data
  },

  // Obtener ventas guardadas del día actual
  getDailySales: (): SaleWithProducts[] => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('dailySales') || '[]') as SaleWithProducts[]
    }
    return []
  },

  // Limpiar ventas del día (para cierre de caja)
  clearDailySales: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dailySales')
    }
  }
}

// ==================== REPORTS ====================
export interface DailyReport {
  totalSales: number | string // BigDecimal desde backend, puede venir como número o string
  totalTransactions: number
  salesByPaymentMethod: {
    [key: string]: number | string // Permite llaves dinámicas y valores numéricos o string
  }
}

export interface SaleItemDetailDto {
  productName: string
  size: string
  quantity: number
  unitPrice: number | string
}

export interface SaleDetailDto {
  saleId: number
  date: string
  total: number | string
  paymentMethod: string
  status: string
  branchName: string
  sellerName: string
  items: SaleItemDetailDto[]
}

export const reportService = {
  getDaily: async (): Promise<DailyReport> => {
    const response = await api.get<DailyReport>('/reports/daily')
    return response.data
  },

  getDailySales: async (): Promise<SaleDetailDto[]> => {
    const response = await api.get<SaleDetailDto[]>('/reports/daily/sales')
    return response.data
  }
}

export default api