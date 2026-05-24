"use client"

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom' // <- Volvemos al original
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { ShoppingCart, Package, FolderPlus, BarChart3, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'

const menuItems = [
  { id: 'pos', label: 'Nueva Venta', icon: ShoppingCart, path: '/pos' },
  { id: 'inventory', label: 'Inventario', icon: Package, path: '/inventory' },
  { id: 'products', label: 'Nuevo Producto', icon: FolderPlus, path: '/new-product' },
  { id: 'reports', label: 'Reportes', icon: BarChart3, path: '/reports' },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
      <div className="flex h-screen bg-background">
        <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-40 flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="text-muted-foreground">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-semibold text-foreground">Beraka Modas</span>
          <div className="w-10" />
        </header>

        {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />}

        <aside className={cn("flex-col h-screen bg-card border-r border-border transition-all duration-300 hidden lg:flex", collapsed ? "lg:w-16" : "lg:w-56", mobileOpen ? "flex fixed left-0 top-0 z-50 w-64" : "")}>
          <div className={cn("h-16 flex items-center border-b border-border px-4", collapsed ? "justify-center" : "justify-between")}>
            {!collapsed && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">BM</span>
                  </div>
                  <span className="font-semibold text-foreground">Beraka Modas</span>
                </div>
            )}
            {collapsed && <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><span className="text-primary font-bold text-sm">BM</span></div>}
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                  <Link key={item.id} to={item.path} onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-muted", isActive && "bg-primary/10 text-primary", !isActive && "text-muted-foreground", collapsed && "justify-center px-2")}>
                    <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-border space-y-2">
            {!collapsed && user && (
                <div className="px-3 py-2 text-xs text-muted-foreground overflow-hidden">
                  <p className="font-medium text-foreground truncate">{user.username}</p>
                  <p className="truncate">Rol: {user.role}</p>
                </div>
            )}
            <button onClick={handleLogout} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive", collapsed && "justify-center px-2")}>
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
            </button>
          </div>

          <div className="hidden lg:block p-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className={cn("w-full text-muted-foreground hover:text-foreground", collapsed && "px-0 justify-center")}>
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 mr-2" /><span>Colapsar</span></>}
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
  )
}