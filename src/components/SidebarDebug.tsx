import React from 'react'
import { useScreenSize } from '../hooks/useScreenSize'

export function SidebarDebug() {
  const { width, isTablet, isMobile } = useScreenSize()
  
  return (
    <div className="fixed top-0 right-0 bg-black text-white p-2 text-xs z-50">
      <div>Width: {width}px</div>
      <div>isTablet: {isTablet ? 'true' : 'false'}</div>
      <div>isMobile: {isMobile ? 'true' : 'false'}</div>
      <div>Sidebar: {isTablet ? 'VISIBLE' : 'HIDDEN'}</div>
    </div>
  )
}
