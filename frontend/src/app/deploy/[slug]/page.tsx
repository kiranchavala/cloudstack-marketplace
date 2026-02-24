'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deployApp, getZones, getOfferings, getTemplates } from '@/lib/api'
import { use } from 'react'
import type { CloudStackZone, CloudStackOffering, CloudStackTemplate } from '@/types'

interface DeployPageProps {
  params: Promise<{ slug: string }>
}

export default function DeployPage({ params }: DeployPageProps) {
  const { slug } = use(params)
  const router = useRouter()

  const [zones, setZones] = useState<CloudStackZone[]>([])
  const [offerings, setOfferings] = useState<CloudStackOffering[]>([])
  const [templates, setTemplates] = useState<CloudStackTemplate[]>([])
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedOffering, setSelectedOffering] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingResources, setLoadingResources] = useState(true)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadResources() {
      try {
        const [zonesData, offeringsData] = await Promise.all([getZones(), getOfferings()])
        setZones(zonesData.zones)
        setOfferings(offeringsData.offerings)
        if (zonesData.zones.length > 0) setSelectedZone(zonesData.zones[0].id)
        if (offeringsData.offerings.length > 0) setSelectedOffering(offeringsData.offerings[0].id)
      } catch {
        setError('Failed to load zones and offerings. Please try again.')
      } finally {
        setLoadingResources(false)
      }
    }
    loadResources()
  }, [])

  useEffect(() => {
    if (!selectedZone) return
    setLoadingTemplates(true)
    setSelectedTemplate('')
    getTemplates(selectedZone)
      .then((data) => {
        setTemplates(data.templates)
        if (data.templates.length > 0) setSelectedTemplate(data.templates[0].id)
      })
      .catch(() => setError('Failed to load templates for this zone.'))
      .finally(() => setLoadingTemplates(false))
  }, [selectedZone])

  const handleDeploy = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await deployApp({
        appSlug: slug,
        zoneId: selectedZone,
        serviceOfferingId: selectedOffering,
        templateId: selectedTemplate,
      })
      router.push(`/dashboard?deploying=${result.deployment.id}`)
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

      {loadingResources ? (
        <div className="text-center py-12 text-gray-500">Loading available zones and sizes...</div>
      ) : (
        <>
          {/* Zone Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Zone</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedZone === zone.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{zone.name}</div>
                    <div className="text-sm text-gray-500">{zone.networktype} · {zone.allocationstate}</div>
                  </div>
                  {selectedZone === zone.id && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Template</h2>
            {loadingTemplates ? (
              <div className="text-center py-6 text-gray-500 text-sm">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No templates available for this zone.</div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-500">
                        {template.ostypename}
                        {template.size ? ` · ${Math.round(template.size / (1024 * 1024 * 1024))}GB` : ''}
                      </div>
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Offering Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Size</h2>
            <div className="space-y-3">
              {offerings.map((offering) => (
                <button
                  key={offering.id}
                  onClick={() => setSelectedOffering(offering.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedOffering === offering.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{offering.name}</div>
                    <div className="text-sm text-gray-500">
                      {offering.cpunumber} vCPU · {offering.memory >= 1024 ? `${offering.memory / 1024}GB` : `${offering.memory}MB`} RAM
                    </div>
                  </div>
                  {selectedOffering === offering.id && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Deploy Button */}
      <button
        onClick={handleDeploy}
        disabled={loading || loadingResources || !selectedZone || !selectedOffering || !selectedTemplate}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Deploying...' : 'Deploy Now'}
      </button>
    </div>
  )
}
