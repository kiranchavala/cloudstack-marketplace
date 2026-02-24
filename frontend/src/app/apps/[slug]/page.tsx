import { notFound } from 'next/navigation'
import DeployButton from '@/components/DeployButton'
import type { App } from '@/types'

// Sample app data (in production, fetched from API)
const APPS: Record<string, App> = {
  wordpress: {
    id: '1',
    name: 'WordPress',
    slug: 'wordpress',
    description:
      'WordPress is the world\'s most popular CMS, powering over 40% of the web. This image includes the latest version of WordPress, Apache, MySQL, and PHP. Ideal for blogs, business websites, and online stores.',
    category: 'CMS',
    tags: ['cms', 'blog', 'php', 'mysql', 'apache'],
    icon: '🌐',
    version: '6.4',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    averageRating: 4.7,
    reviews: [
      {
        id: 'r1',
        userId: 'u1',
        appId: '1',
        user: { id: 'u1', email: 'alice@example.com', role: 'user', createdAt: '' },
        rating: 5,
        comment: 'Works perfectly out of the box. Deployed in 2 minutes!',
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
  lamp: {
    id: '2',
    name: 'LAMP Stack',
    slug: 'lamp',
    description:
      'Linux, Apache, MySQL, and PHP — the classic web development stack. This image comes pre-configured and ready to host PHP applications.',
    category: 'Dev Tools',
    tags: ['linux', 'apache', 'mysql', 'php'],
    icon: '🔥',
    version: '8.2',
    osType: 'Ubuntu 22.04',
    status: 'active',
    vendorId: 'v1',
    averageRating: 4.5,
    reviews: [],
    createdAt: new Date().toISOString(),
  },
}

interface AppDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params
  const app = APPS[slug]

  if (!app) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Icon */}
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
            {app.icon}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                {app.category}
              </span>
              <span className="text-xs text-gray-400">v{app.version}</span>
              <span className="text-xs text-gray-400">{app.osType}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{app.name}</h1>
            <p className="text-gray-600 mb-4 leading-relaxed">{app.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {app.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Rating */}
            {app.averageRating && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= Math.round(app.averageRating!) ? 'text-yellow-400' : 'text-gray-200'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {app.averageRating.toFixed(1)} ({app.reviews?.length} review{app.reviews?.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <DeployButton slug={app.slug} />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
        {app.reviews && app.reviews.length > 0 ? (
          <div className="space-y-6">
            {app.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {review.user?.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{review.user?.email}</div>
                    <div className="flex text-yellow-400 text-sm">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  )
}
