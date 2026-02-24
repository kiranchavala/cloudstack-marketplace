const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Attach JWT token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Apps
export const getApps = (params?: Record<string, string>) => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : ''
  return fetchApi<{ apps: import('@/types').App[]; total: number }>(`/apps${query}`)
}

export const getApp = (slug: string) =>
  fetchApi<{ app: import('@/types').App }>(`/apps/${slug}`)

// Auth
export const login = (email: string, password: string) =>
  fetchApi<{ token: string; user: import('@/types').User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const register = (email: string, password: string) =>
  fetchApi<{ token: string; user: import('@/types').User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

// Deploy
export const deployApp = (options: import('@/types').DeployOptions) =>
  fetchApi<{ deployment: import('@/types').Deployment }>('/deploy', {
    method: 'POST',
    body: JSON.stringify(options),
  })

// Reviews
export const getReviews = (slug: string) =>
  fetchApi<{ reviews: import('@/types').Review[] }>(`/apps/${slug}/reviews`)

export const submitReview = (slug: string, rating: number, comment: string) =>
  fetchApi<{ review: import('@/types').Review }>(`/apps/${slug}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  })

// Vendor
export const submitVendorApp = (data: Partial<import('@/types').App>) =>
  fetchApi<{ app: import('@/types').App }>('/vendor/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  })

// Dashboard
export const getMyDeployments = () =>
  fetchApi<{ deployments: import('@/types').Deployment[] }>('/deploy/my')
