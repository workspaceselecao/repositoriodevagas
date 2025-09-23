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
          "relative flex h-screen flex-col border-r bg-card transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Menu</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
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
          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
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
