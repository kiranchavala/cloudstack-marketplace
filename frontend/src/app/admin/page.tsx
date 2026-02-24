import type { App } from '@/types'
import Link from 'next/link'

// Sample apps for admin demo
const PENDING_APPS: App[] = [
  {
    id: 'p1',
    name: 'My Custom App',
    slug: 'my-custom-app',
    description: 'A vendor-submitted application pending review.',
    category: 'Dev Tools',
    tags: ['custom'],
    icon: '🔧',
    version: '1.0',
    osType: 'Ubuntu 22.04',
    status: 'pending',
    vendorId: 'v2',
    createdAt: new Date().toISOString(),
  },
]

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Manage marketplace apps, users, and deployments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-blue-600">8</div>
          <div className="text-gray-500 text-sm mt-1">Total Apps</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-yellow-600">1</div>
          <div className="text-gray-500 text-sm mt-1">Pending Review</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-green-600">42</div>
          <div className="text-gray-500 text-sm mt-1">Total Users</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-indigo-600">15</div>
          <div className="text-gray-500 text-sm mt-1">Active Deployments</div>
        </div>
      </div>

      {/* Pending Apps */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Pending App Submissions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {PENDING_APPS.map((app) => (
            <div key={app.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{app.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{app.name}</div>
                  <div className="text-sm text-gray-500">{app.category} · v{app.version}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  Pending
                </span>
                <button className="text-sm text-green-600 hover:text-green-800 font-medium px-3 py-1 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                  Approve
                </button>
                <button className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/apps"
          className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all text-center"
        >
          <div className="text-2xl mb-2">📦</div>
          <div className="font-medium text-gray-900">Manage Apps</div>
        </Link>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center opacity-60 cursor-not-allowed">
          <div className="text-2xl mb-2">👥</div>
          <div className="font-medium text-gray-900">Manage Users</div>
          <div className="text-xs text-gray-400 mt-1">Coming soon</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center opacity-60 cursor-not-allowed">
          <div className="text-2xl mb-2">🖥️</div>
          <div className="font-medium text-gray-900">View Deployments</div>
          <div className="text-xs text-gray-400 mt-1">Coming soon</div>
        </div>
      </div>
    </div>
  )
}
