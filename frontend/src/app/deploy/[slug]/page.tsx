'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CLOUDSTACK_REGIONS, CLOUDSTACK_SIZES } from '@/lib/cloudstack'
import { deployApp } from '@/lib/api'
import { use } from 'react'

interface DeployPageProps {
  params: Promise<{ slug: string }>
}

export default function DeployPage({ params }: DeployPageProps) {
  const { slug } = use(params)
  const router = useRouter()

  const [selectedRegion, setSelectedRegion] = useState(CLOUDSTACK_REGIONS[0].id)
  const [selectedSize, setSelectedSize] = useState(CLOUDSTACK_SIZES[0].id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDeploy = async () => {
    setLoading(true)
    setError('')
    try {
      await deployApp({ appSlug: slug, region: selectedRegion, size: selectedSize })
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Deployment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Deploy App</h1>
      <p className="text-gray-500 mb-8">
        Configure and deploy <span className="font-semibold capitalize">{slug}</span> to your CloudStack environment.
      </p>

      {/* Region Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Region</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CLOUDSTACK_REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                selectedRegion === region.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">{region.name}</div>
                <div className="text-sm text-gray-500">{region.description}</div>
              </div>
              {selectedRegion === region.id && (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Size</h2>
        <div className="space-y-3">
          {CLOUDSTACK_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => setSelectedSize(size.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                selectedSize === size.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <div className="font-medium text-gray-900">{size.name}</div>
                  <div className="text-sm text-gray-500">
                    {size.cpu} vCPU · {size.memory >= 1024 ? `${size.memory / 1024}GB` : `${size.memory}MB`} RAM · {size.disk}GB SSD
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">{size.price}</span>
                {selectedSize === size.id && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Deploy Button */}
      <button
        onClick={handleDeploy}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Deploying...' : 'Deploy Now'}
      </button>
    </div>
  )
}
