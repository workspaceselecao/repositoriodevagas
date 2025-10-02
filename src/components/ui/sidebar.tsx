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
