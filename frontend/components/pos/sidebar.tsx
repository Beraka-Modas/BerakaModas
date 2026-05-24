"use client"

import { useState } from "react"
import { 
  ShoppingCart, 
  Package, 
  Tags, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
}

const menuItems = [
  { id: "pos", label: "Nueva Venta", icon: ShoppingCart },
  { id: "inventory", label: "Inventario", icon: Package },
  { id: "categories", label: "Categorías", icon: Tags },
  { id: "reports", label: "Reportes", icon: BarChart3 },
]

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-card border-b border-border">
        <div className="flex flex-col">
          <span className="font-semibold text-foreground tracking-tight text-sm">Beraka</span>
          <span className="text-[10px] text-muted-foreground -mt-0.5">Modas</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon-sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "flex-col h-screen bg-card border-r border-border transition-all duration-300",
          // Desktop
          "hidden lg:flex",
          collapsed ? "lg:w-16" : "lg:w-56",
          // Mobile - override hidden when mobileOpen
          mobileOpen ? "flex fixed left-0 top-0 z-50 w-64" : ""
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 h-16">
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground tracking-tight">Beraka</span>
              <span className="text-xs text-muted-foreground -mt-0.5">Modas</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={() => mobileOpen ? setMobileOpen(false) : setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? (
              <X className="size-4" />
            ) : collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>

        <Separator />

        {/* Menu Items */}
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onItemClick(item.id)
                  setMobileOpen(false)
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-border">
          <button
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium",
              "text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            )}
          >
            <LogOut className="size-4 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
