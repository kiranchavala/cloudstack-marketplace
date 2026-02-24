'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { id: '', label: 'All Apps', icon: '🌐' },
  { id: 'cms', label: 'CMS', icon: '📝' },
  { id: 'database', label: 'Database', icon: '🗄️' },
  { id: 'devtools', label: 'Dev Tools', icon: '🛠️' },
  { id: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { id: 'monitoring', label: 'Monitoring', icon: '📊' },
  { id: 'security', label: 'Security', icon: '🔐' },
  { id: 'media', label: 'Media', icon: '🎬' },
]

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category') || ''

  const handleSelect = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    router.push(`/apps?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            activeCategory === cat.id
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}
