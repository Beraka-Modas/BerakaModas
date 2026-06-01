"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Loader2,
  Banknote,
  CreditCard,
  ArrowRightLeft
} from 'lucide-react'
import { reportService, type DailyReport, type SaleDetailDto } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

export function ReportsPage() {
  const [report, setReport] = useState<DailyReport | null>(null)
  const [sales, setSales] = useState<SaleDetailDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const { user } = useAuth()

  // 1. Llamada a Spring Boot para traer el Cierre de Caja
  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await reportService.getDaily()
        setReport(data)

        // Cargar ventas detalladas desde el backend
        const dailySalesData = await reportService.getDailySales()
        setSales(dailySalesData)
      } catch (error: any) {
        console.error('Error al cargar reporte:', error)
        if (error.response?.status === 403) {
          setErrorMsg('No tienes permisos de Administrador para ver los reportes financieros.')
        } else {
          setErrorMsg('Ocurrió un error al cargar los datos del servidor.')
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadReport()
  }, [])

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(isNaN(numValue) ? 0 : numValue)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // RNF-04: RBAC UI - Si es vendedor, le mostramos el bloqueo visual
  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
          <XIcon className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium text-foreground">{errorMsg}</p>
      </div>
    )
  }

  if (!report) return null;

  // Calculamos métricas derivadas
  const totalSales = typeof report.totalSales === 'string' ? parseFloat(report.totalSales) : report.totalSales
  const totalTransactions = report.totalTransactions || 0
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0

  // Convertir valores de métodos de pago a números
  const paymentMethodValues = Object.entries(report.salesByPaymentMethod || {}).reduce((acc, [key, value]) => {
    acc[key] = typeof value === 'string' ? parseFloat(value) : value
    return acc
  }, {} as Record<string, number>)

  const valEfectivo = paymentMethodValues['Efectivo'] || 0
  const valTarjeta = paymentMethodValues['Tarjeta'] || 0
  const valTransferencia = paymentMethodValues['Transferencia'] || 0

  const paymentMethods = [
    {
      name: 'Efectivo',
      value: valEfectivo,
      icon: Banknote,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700'
    },
    {
      name: 'Tarjeta',
      value: valTarjeta,
      icon: CreditCard,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700'
    },
    {
      name: 'Transferencia',
      value: valTransferencia,
      icon: ArrowRightLeft,
      color: 'bg-violet-500',
      bgColor: 'bg-violet-100',
      textColor: 'text-violet-700'
    }
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cierre de Caja</h1>
        <p className="text-muted-foreground text-sm">
          Reporte en tiempo real de la jornada actual
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ventas Totales</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(totalSales)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transacciones</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {totalTransactions}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Promedio</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(averageTicket)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Desglose por Método de Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentMethods.map((method) => {
            const percentage = totalSales > 0 ? (method.value / totalSales) * 100 : 0
            const Icon = method.icon

            return (
              <div key={method.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", method.bgColor)}>
                      <Icon className={cn("h-4 w-4", method.textColor)} />
                    </div>
                    <span className="font-medium text-foreground">{method.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-foreground">{formatCurrency(method.value)}</span>
                    <span className="text-muted-foreground text-sm ml-2">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", method.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Ventas del Día - Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Detalle de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay ventas registradas en el día</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha/Hora</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Productos (Cantidad × Talla)</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Método</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Valor</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Local</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vendedor</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.saleId} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4 text-xs">
                        {sale.date ? new Date(sale.date).toLocaleString('es-CO') : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="space-y-1">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="text-muted-foreground">
                              {item.quantity} × {item.size}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-xs">
                        {sale.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {sale.branchName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {sale.sellerName || 'Desconocido'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function XIcon(props: any) {
  return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
      </svg>
  )
}