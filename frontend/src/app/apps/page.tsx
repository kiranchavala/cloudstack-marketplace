import { Suspense } from 'react'
import AppGrid from '@/components/AppGrid'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import type { App } from '@/types'

// Sample apps for demo
const ALL_APPS: App[] = [
  {
    id: '1',
    name: 'WordPress',
    slug: 'wordpress',
    description: 'The world\'s most popular CMS. Create beautiful websites, blogs, and stores.',
    category: 'CMS',
    tags: ['cms', 'blog', 'php', 'mysql'],
    icon: '🌐',
    version: '6.4',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'LAMP Stack',
    slug: 'lamp',
    description: 'Linux, Apache, MySQL, PHP — the classic web development stack pre-configured.',
    category: 'Dev Tools',
    tags: ['linux', 'apache', 'mysql', 'php'],
    icon: '🔥',
    version: '8.2',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'PostgreSQL',
    slug: 'postgresql',
    description: 'The world\'s most advanced open source relational database system.',
    category: 'Database',
    tags: ['database', 'sql', 'postgres'],
    icon: '🗄️',
    version: '15',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Node.js',
    slug: 'nodejs',
    description: 'JavaScript runtime built on Chrome\'s V8 engine for building server-side applications.',
    category: 'Dev Tools',
    tags: ['javascript', 'nodejs', 'runtime'],
    icon: '⚙️',
    version: '20 LTS',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Redis',
    slug: 'redis',
    description: 'In-memory data structure store used as database, cache, and message broker.',
    category: 'Database',
    tags: ['cache', 'redis', 'nosql'],
    icon: '⚡',
    version: '7',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'WooCommerce',
    slug: 'woocommerce',
    description: 'Open source eCommerce plugin for WordPress. Build any online store.',
    category: 'E-Commerce',
    tags: ['ecommerce', 'wordpress', 'shop'],
    icon: '🛒',
    version: '8.5',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Grafana',
    slug: 'grafana',
    description: 'Open source analytics and monitoring platform with beautiful dashboards.',
    category: 'Monitoring',
    tags: ['monitoring', 'metrics', 'dashboard'],
    icon: '📊',
    version: '10',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'GitLab CE',
    slug: 'gitlab',
    description: 'Open source end-to-end software development platform with CI/CD.',
    category: 'Dev Tools',
    tags: ['git', 'ci-cd', 'devops'],
    icon: '🦊',
    version: '16',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    createdAt: new Date().toISOString(),
  },
]

interface AppsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>
}

export default async function AppsPage({ searchParams }: AppsPageProps) {
  const params = await searchParams
  const query = params.q?.toLowerCase() || ''
  const category = params.category?.toLowerCase() || ''

  const filteredApps = ALL_APPS.filter((app) => {
    const matchesQuery =
      !query ||
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      app.tags.some((t) => t.toLowerCase().includes(query))
    const matchesCategory =
      !category || app.category.toLowerCase().replace(/\s/g, '') === category.replace(/\s/g, '')
    return matchesQuery && matchesCategory
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Apps</h1>
        <p className="text-gray-500">Discover and deploy pre-configured apps to your CloudStack environment</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar defaultValue={query} />
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <Suspense>
          <CategoryFilter />
        </Suspense>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        {filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''} found
        {query && ` for "${query}"`}
        {category && ` in ${category}`}
      </div>

      {/* Grid */}
      <AppGrid apps={filteredApps} />
    </div>
  )
}
