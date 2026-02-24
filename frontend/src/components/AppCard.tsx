import Link from 'next/link'
import type { App } from '@/types'

interface AppCardProps {
  app: App
}

export default function AppCard({ app }: AppCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group">
      {/* Icon */}
      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
        <span className="text-2xl">{app.icon || '📦'}</span>
      </div>

      {/* Name & Category */}
      <div className="mb-2">
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded">
          {app.category}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
        {app.name}
      </h3>
      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{app.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {app.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">v{app.version} · {app.osType}</span>
        <Link
          href={`/apps/${app.slug}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}
