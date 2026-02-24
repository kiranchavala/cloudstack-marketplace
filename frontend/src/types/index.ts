export interface App {
  id: string
  name: string
  slug: string
  description: string
  category: string
  tags: string[]
  icon: string
  version: string
  osType: string
  status: 'active' | 'pending' | 'rejected'
  vendorId: string
  vendor?: User
  reviews?: Review[]
  averageRating?: number
  createdAt: string
}

export interface User {
  id: string
  email: string
  role: 'user' | 'vendor' | 'admin'
  createdAt: string
}

export interface Deployment {
  id: string
  userId: string
  appId: string
  app?: App
  cloudstackVmId: string
  cloudstackJobId?: string
  status: 'pending' | 'deploying' | 'running' | 'stopped' | 'failed' | 'destroyed'
  region: string
  size: string
  ipAddress?: string
  destroyedAt?: string
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  appId: string
  user?: User
  rating: number
  comment: string
  createdAt: string
}

export interface Category {
  id: string
  label: string
  icon: string
}

export interface DeployOptions {
  appSlug: string
  zoneId: string
  serviceOfferingId: string
}

export interface CloudStackZone {
  id: string
  name: string
  networktype: string
  allocationstate: string
}

export interface CloudStackOffering {
  id: string
  name: string
  cpunumber: number
  memory: number
  displaytext: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}
