import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import AppGrid from '@/components/AppGrid'
import type { App } from '@/types'

// Sample featured apps for demo
const FEATURED_APPS: App[] = [
  {
    id: '1',
    name: 'WordPress',
    slug: 'wordpress',
    description: 'The world\'s most popular CMS. Create beautiful websites with ease.',
    category: 'CMS',
    tags: ['cms', 'blog', 'php'],
    icon: '🌐',
    version: '6.4',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'vendor-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'LAMP Stack',
    slug: 'lamp',
    description: 'Linux, Apache, MySQL, PHP — the classic web development stack.',
    category: 'Dev Tools',
    tags: ['linux', 'apache', 'mysql', 'php'],
    icon: '🔥',
    version: '8.2',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'vendor-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'PostgreSQL',
    slug: 'postgresql',
    description: 'The world\'s most advanced open source relational database.',
    category: 'Database',
    tags: ['database', 'sql', 'postgres'],
    icon: '🗄️',
    version: '15',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'vendor-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Node.js',
    slug: 'nodejs',
    description: 'JavaScript runtime built on Chrome\'s V8 engine for server-side apps.',
    category: 'Dev Tools',
    tags: ['javascript', 'nodejs', 'runtime'],
    icon: '⚙️',
    version: '20 LTS',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'vendor-1',
    createdAt: new Date().toISOString(),
  },
]

const CATEGORIES = [
  { id: 'cms', label: 'CMS', icon: '📝' },
  { id: 'database', label: 'Database', icon: '🗄️' },
  { id: 'devtools', label: 'Dev Tools', icon: '🛠️' },
  { id: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { id: 'monitoring', label: 'Monitoring', icon: '📊' },
  { id: 'security', label: 'Security', icon: '🔐' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Deploy Apps to <br />
            <span className="text-blue-300">Apache CloudStack</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Browse pre-configured apps, stacks, and developer tools. Deploy to your CloudStack environment with a single click.
          </p>
          <div className="flex justify-center">
            <SearchBar placeholder="Search WordPress, MySQL, Docker..." />
          </div>
          <div className="mt-6 text-blue-200 text-sm">
            100+ apps available · One-click deploy · Open Source
          </div>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/apps?category=${cat.id}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {cat.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Apps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Apps</h2>
          <Link href="/apps" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View all →
          </Link>
        </div>
        <AppGrid apps={FEATURED_APPS} />
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-50 border-y border-blue-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Have an app to share?
          </h2>
          <p className="text-gray-600 mb-6">
            Submit your app to the CloudStack Marketplace and reach thousands of users.
          </p>
          <Link
            href="/vendor"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Become a Vendor
          </Link>
        </div>
      </section>
    </div>
  )
}
