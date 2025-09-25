import React from 'react'
import { Skeleton } from './skeleton'
import { Card, CardContent, CardHeader } from './card'

interface LoadingCardProps {
  showIcon?: boolean
  showMetrics?: boolean
  className?: string
}

export function LoadingCard({ showIcon = true, showMetrics = true, className = '' }: LoadingCardProps) {
  return (
    <Card className={`animate-pulse ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        {showIcon && <Skeleton className="h-8 w-8 rounded-lg" />}
      </CardHeader>
      <CardContent>
        {showMetrics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function LoadingGrid({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>
  )
}
