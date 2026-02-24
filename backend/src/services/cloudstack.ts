import axios from 'axios'
import crypto from 'crypto'

const CLOUDSTACK_API_URL = process.env.CLOUDSTACK_API_URL || ''
const CLOUDSTACK_API_KEY = process.env.CLOUDSTACK_API_KEY || ''
const CLOUDSTACK_SECRET_KEY = process.env.CLOUDSTACK_SECRET_KEY || ''

/**
 * Sign and execute a CloudStack API request.
 */
async function cloudstackRequest(command: string, params: Record<string, string> = {}) {
  const allParams: Record<string, string> = {
    ...params,
    command,
    apiKey: CLOUDSTACK_API_KEY,
    response: 'json',
  }

  // Sort params and create the signature
  const sortedKeys = Object.keys(allParams).sort()
  const queryString = sortedKeys
    .map((k) => `${encodeURIComponent(k.toLowerCase())}=${encodeURIComponent(allParams[k])}`)
    .join('&')

  const signature = crypto
    .createHmac('sha1', CLOUDSTACK_SECRET_KEY)
    .update(queryString.toLowerCase())
    .digest('base64')

  const url = `${CLOUDSTACK_API_URL}?${queryString}&signature=${encodeURIComponent(signature)}`
  const response = await axios.get(url)
  return response.data
}

export interface DeployVMOptions {
  templateId: string
  serviceOfferingId: string
  zoneId: string
  name: string
}

/**
 * Deploy a Virtual Machine via CloudStack API.
 */
export async function deployVirtualMachine(
  options: DeployVMOptions
): Promise<{ vmId: string; status: string }> {
  const response = await cloudstackRequest('deployVirtualMachine', {
    templateid: options.templateId,
    serviceofferingid: options.serviceOfferingId,
    zoneid: options.zoneId,
    name: options.name,
    displayname: options.name,
  })

  const vm = response.deployvirtualmachineresponse?.virtualmachine
  return {
    vmId: vm?.id || 'unknown',
    status: vm?.state || 'pending',
  }
}

/**
 * List available VM templates.
 */
export async function listTemplates(zoneId?: string) {
  const params: Record<string, string> = { templatefilter: 'executable' }
  if (zoneId) params.zoneid = zoneId
  const response = await cloudstackRequest('listTemplates', params)
  return response.listtemplatesresponse?.template || []
}

/**
 * List virtual machines for the account.
 */
export async function listVirtualMachines(zoneId?: string) {
  const params: Record<string, string> = {}
  if (zoneId) params.zoneid = zoneId
  const response = await cloudstackRequest('listVirtualMachines', params)
  return response.listvirtualmachinesresponse?.virtualmachine || []
}
