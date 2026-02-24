import type { App } from '@/types'
import AppCard from './AppCard'

interface AppGridProps {
  apps: App[]
  loading?: boolean
}

export default function AppGrid({ apps, loading }: AppGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
          >
            <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/3" />
            <div className="h-5 bg-gray-200 rounded mb-2 w-2/3" />
            <div className="h-4 bg-gray-200 rounded mb-1 w-full" />
            <div className="h-4 bg-gray-200 rounded mb-4 w-4/5" />
          </div>
        ))}
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg font-medium">No apps found</p>
        <p className="text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  )
}
