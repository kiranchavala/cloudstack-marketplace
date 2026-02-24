// CloudStack API helper utilities for the frontend
// These are used for listing regions, sizes, and templates available in CloudStack

export interface CloudStackRegion {
  id: string
  name: string
  description: string
}

export interface CloudStackSize {
  id: string
  name: string
  cpu: number
  memory: number // MB
  disk: number // GB
  price: string
}

// Pre-defined region list (populated from CloudStack zones)
export const CLOUDSTACK_REGIONS: CloudStackRegion[] = [
  { id: 'zone-1', name: 'US East', description: 'United States - East' },
  { id: 'zone-2', name: 'US West', description: 'United States - West' },
  { id: 'zone-3', name: 'EU Frankfurt', description: 'Europe - Frankfurt' },
  { id: 'zone-4', name: 'AP Singapore', description: 'Asia Pacific - Singapore' },
]

// Pre-defined VM sizes (service offerings)
export const CLOUDSTACK_SIZES: CloudStackSize[] = [
  { id: 'small', name: 'Small', cpu: 1, memory: 1024, disk: 25, price: '$5/mo' },
  { id: 'medium', name: 'Medium', cpu: 2, memory: 2048, disk: 50, price: '$10/mo' },
  { id: 'large', name: 'Large', cpu: 4, memory: 4096, disk: 80, price: '$20/mo' },
  { id: 'xlarge', name: 'XLarge', cpu: 8, memory: 8192, disk: 160, price: '$40/mo' },
]
