import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="font-bold text-xl text-white">CloudStack Marketplace</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Browse, search, and one-click deploy pre-configured apps onto Apache CloudStack infrastructure.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/apps" className="hover:text-white transition-colors">Browse Apps</Link></li>
              <li><Link href="/apps?category=cms" className="hover:text-white transition-colors">CMS</Link></li>
              <li><Link href="/apps?category=database" className="hover:text-white transition-colors">Databases</Link></li>
              <li><Link href="/apps?category=devtools" className="hover:text-white transition-colors">Dev Tools</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/vendor" className="hover:text-white transition-colors">Vendor Portal</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li>
                <a
                  href="https://github.com/kiranchavala/cloudstack-marketplace"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} CloudStack Marketplace. Built on Apache CloudStack.
        </div>
      </div>
    </footer>
  )
}
