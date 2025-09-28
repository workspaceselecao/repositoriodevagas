import React, { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export function ThemeDebug() {
  const { mode, profile, config } = useTheme()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const updateDebugInfo = () => {
      const root = document.documentElement
      const title = document.querySelector('.app-title')
      const button = document.querySelector('.bg-primary')
      
      setDebugInfo({
        htmlClasses: root.className,
        cssPrimary: getComputedStyle(root).getPropertyValue('--primary'),
        titleColor: title ? getComputedStyle(title).color : 'N/A',
        buttonColor: button ? getComputedStyle(button).backgroundColor : 'N/A',
        expectedPrimary: config.colors.primary,
        mode,
        profile
      })
    }

    updateDebugInfo()
    const interval = setInterval(updateDebugInfo, 1000)
    
    return () => clearInterval(interval)
  }, [mode, profile, config])

  const isCorrect = debugInfo.cssPrimary?.includes('346.8') && 
                   debugInfo.titleColor === debugInfo.buttonColor

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: isCorrect ? '#d4edda' : '#f8d7da',
      color: isCorrect ? '#155724' : '#721c24',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      border: `1px solid ${isCorrect ? '#c3e6cb' : '#f5c6cb'}`,
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>🎨 Theme Debug</strong></div>
      <div>Mode: {debugInfo.mode}</div>
      <div>Profile: {debugInfo.profile}</div>
      <div>Classes: {debugInfo.htmlClasses}</div>
      <div>CSS Primary: {debugInfo.cssPrimary}</div>
      <div>Expected: {debugInfo.expectedPrimary}</div>
      <div>Title Color: {debugInfo.titleColor}</div>
      <div>Button Color: {debugInfo.buttonColor}</div>
      <div><strong>Status: {isCorrect ? '✅ CORRETO' : '❌ ERRO'}</strong></div>
    </div>
  )
}
