import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarProps {
  children: React.ReactNode
  isCollapsed: boolean
  onToggle: () => void
  className?: string
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ children, isCollapsed, onToggle, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-screen flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out shadow-lg",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">RV</span>
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Repositório
              </h2>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">RV</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hover:bg-primary/10 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
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
          "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:shadow-sm group",
          isCollapsed ? "justify-center" : "justify-start",
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
