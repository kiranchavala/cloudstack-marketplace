'use client'

import Link from 'next/link'

interface DeployButtonProps {
  slug: string
  className?: string
}

export default function DeployButton({ slug, className = '' }: DeployButtonProps) {
  return (
    <Link
      href={`/deploy/${slug}`}
      className={`inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm ${className}`}
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      Deploy Now
    </Link>
  )
}
