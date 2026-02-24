'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getMyDeployments, getDeploymentStatus, stopDeployment, startDeployment, destroyDeployment } from '@/lib/api'
import type { Deployment } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-green-100 text-green-700',
  deploying: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  stopped: 'bg-gray-100 text-gray-700',
  failed: 'bg-red-100 text-red-700',
  destroyed: 'bg-red-50 text-red-400',
}

export default function DashboardPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  const fetchDeployments = useCallback(async () => {
    try {
      const data = await getMyDeployments()
      setDeployments(data.deployments)
    } catch {
      // ignore auth errors when not logged in
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDeployments()
  }, [fetchDeployments])

  // Poll deploying deployments every 5 seconds
  useEffect(() => {
    const deployingIds = deployments
      .filter((d) => d.status === 'deploying')
      .map((d) => d.id)

    if (deployingIds.length === 0) return

    const interval = setInterval(async () => {
      const updates = await Promise.allSettled(
        deployingIds.map((id) => getDeploymentStatus(id))
      )
      setDeployments((prev) =>
        prev.map((dep) => {
          const result = updates[deployingIds.indexOf(dep.id)]
          if (result && result.status === 'fulfilled' && result.value.deployment) {
            return result.value.deployment
          }
          return dep
        })
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [deployments])

  const handleAction = async (
    deploymentId: string,
    action: 'stop' | 'start' | 'destroy'
  ) => {
    setActionLoading((prev) => ({ ...prev, [deploymentId]: true }))
    try {
      let result
      if (action === 'stop') result = await stopDeployment(deploymentId)
      else if (action === 'start') result = await startDeployment(deploymentId)
      else result = await destroyDeployment(deploymentId)
      setDeployments((prev) =>
        prev.map((d) => (d.id === deploymentId ? result.deployment : d))
      )
    } catch {
      // ignore errors
    } finally {
      setActionLoading((prev) => ({ ...prev, [deploymentId]: false }))
    }
  }

  const activeCount = deployments.filter((d) => d.status === 'running').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your deployments and account settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-blue-600">{activeCount}</div>
          <div className="text-gray-500 text-sm mt-1">Active Deployments</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-green-600">{deployments.length}</div>
          <div className="text-gray-500 text-sm mt-1">Apps Deployed (All Time)</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-gray-700">
            {deployments.filter((d) => d.status === 'deploying').length}
          </div>
          <div className="text-gray-500 text-sm mt-1">Deploying Now</div>
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

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading deployments...</div>
        ) : deployments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No deployments yet.{' '}
            <Link href="/apps" className="text-blue-600 hover:underline">
              Deploy your first app
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">App</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Zone</th>
                  <th className="px-6 py-3 text-left">Size</th>
                  <th className="px-6 py-3 text-left">IP Address</th>
                  <th className="px-6 py-3 text-left">Deployed</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{dep.app?.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{dep.app?.name}</div>
                          <div className="text-xs text-gray-400">{dep.cloudstackVmId || dep.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[dep.status] || 'bg-gray-100 text-gray-700'}`}>
                        {dep.status === 'deploying' && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" />
                        )}
                        {dep.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dep.region}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dep.size}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{dep.ipAddress || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(dep.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {dep.status === 'running' && (
                          <button
                            onClick={() => handleAction(dep.id, 'stop')}
                            disabled={actionLoading[dep.id]}
                            className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                          >
                            Stop
                          </button>
                        )}
                        {dep.status === 'stopped' && (
                          <button
                            onClick={() => handleAction(dep.id, 'start')}
                            disabled={actionLoading[dep.id]}
                            className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                          >
                            Start
                          </button>
                        )}
                        {(dep.status === 'running' || dep.status === 'stopped') && (
                          <button
                            onClick={() => handleAction(dep.id, 'destroy')}
                            disabled={actionLoading[dep.id]}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            Destroy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
