import type { Deployment } from '@/types'
import Link from 'next/link'

// Sample deployments for demo
const SAMPLE_DEPLOYMENTS: Deployment[] = [
  {
    id: 'd1',
    userId: 'u1',
    appId: '1',
    app: {
      id: '1',
      name: 'WordPress',
      slug: 'wordpress',
      description: '',
      category: 'CMS',
      tags: [],
      icon: '🌐',
      version: '6.4',
      osType: 'Ubuntu 22.04',
      status: 'active',
      vendorId: 'v1',
      createdAt: '',
    },
    cloudstackVmId: 'vm-abc123',
    status: 'running',
    region: 'US East',
    size: 'Medium',
    ipAddress: '192.168.1.100',
    createdAt: new Date().toISOString(),
  },
]

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  stopped: 'bg-gray-100 text-gray-700',
  failed: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your deployments and account settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-blue-600">1</div>
          <div className="text-gray-500 text-sm mt-1">Active Deployments</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-green-600">3</div>
          <div className="text-gray-500 text-sm mt-1">Apps Deployed (All Time)</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-gray-700">2</div>
          <div className="text-gray-500 text-sm mt-1">Reviews Written</div>
        </div>
      </div>

      {/* Deployments Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">My Deployments</h2>
          <Link
            href="/apps"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Deploy New App
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">App</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Region</th>
                <th className="px-6 py-3 text-left">Size</th>
                <th className="px-6 py-3 text-left">IP Address</th>
                <th className="px-6 py-3 text-left">Deployed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SAMPLE_DEPLOYMENTS.map((dep) => (
                <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{dep.app?.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{dep.app?.name}</div>
                        <div className="text-xs text-gray-400">{dep.cloudstackVmId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[dep.status]}`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dep.region}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dep.size}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{dep.ipAddress || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(dep.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
