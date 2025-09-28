import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"

interface SidebarProps {
  children: React.ReactNode
  isCollapsed: boolean
  onToggle: () => void
  className?: string
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ children, isCollapsed, onToggle, className }, ref) => {
    const { mode, profile } = useTheme()
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out shadow-lg",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Header */}
        <div className={`flex items-center border-b ${
          isCollapsed ? "justify-center p-3" : "justify-between p-4"
        }`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">RV</span>
              </div>
              <h2 className="text-lg font-semibold app-title">
                Repositório
              </h2>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">RV</span>
              </div>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 hover:bg-primary/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="absolute top-2 right-2 h-6 w-6 hover:bg-primary/10 transition-colors opacity-0 hover:opacity-100"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 overflow-y-auto ${
          isCollapsed ? "p-2" : "p-4"
        }`}>
          {children}
        </nav>
      </div>
    )
  }
)

Sidebar.displayName = "Sidebar"

interface SidebarItemProps {
  children: React.ReactNode
  isCollapsed: boolean
  className?: string
}

const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ children, isCollapsed, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center rounded-xl transition-all duration-200 hover:bg-primary/10 hover:shadow-sm group",
          isCollapsed ? "justify-center px-2 py-3" : "justify-start px-3 py-2.5",
          className
        )}
      >
        {children}
      </div>
    )
  }
)

SidebarItem.displayName = "SidebarItem"

export { Sidebar, SidebarItem }
