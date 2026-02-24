import axios from 'axios'
import crypto from 'crypto'

const CLOUDSTACK_API_URL = process.env.CLOUDSTACK_API_URL || ''
const CLOUDSTACK_API_KEY = process.env.CLOUDSTACK_API_KEY || ''
const CLOUDSTACK_SECRET_KEY = process.env.CLOUDSTACK_SECRET_KEY || ''

export interface CloudStackZone {
  id: string
  name: string
  networktype: string
  allocationstate: string
}

export interface CloudStackServiceOffering {
  id: string
  name: string
  cpunumber: number
  memory: number
  displaytext: string
}

export interface CloudStackTemplate {
  id: string
  name: string
  ostypename: string
  size: number
  zoneid: string
  zonename: string
}

export interface CloudStackVM {
  id: string
  name: string
  state: string
  zoneid: string
  zonename: string
  templateid: string
  nic: Array<{ ipaddress: string; isdefault: boolean }>
  password?: string
  jobid?: string
}

export interface AsyncJobResult {
  jobid: string
  jobstatus: 0 | 1 | 2
  jobresult?: Record<string, unknown>
  jobresultcode?: number
}

export interface DeployVMOptions {
  templateId: string
  serviceOfferingId: string
  zoneId: string
  name: string
  displayName?: string
  keypair?: string
  userdata?: string
  networkIds?: string[]
}

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

  // Sort params and create the signature (lowercase keys as per CloudStack spec)
  const sortedKeys = Object.keys(allParams).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  )
  const queryString = sortedKeys
    .map((k) => `${encodeURIComponent(k.toLowerCase())}=${encodeURIComponent(allParams[k])}`)
    .join('&')

  const signature = crypto
    .createHmac('sha1', CLOUDSTACK_SECRET_KEY)
    .update(queryString.toLowerCase())
    .digest('base64')

  const url = `${CLOUDSTACK_API_URL}?${queryString}&signature=${encodeURIComponent(signature)}`
  const response = await axios.get(url)

  // Surface CloudStack API errors
  if (response.data?.errorcode) {
    throw new Error(
      response.data.errortext || `CloudStack API error: ${response.data.errorcode}`
    )
  }

  return response.data
}

/**
 * List available CloudStack zones.
 */
export async function listZones(): Promise<CloudStackZone[]> {
  const response = await cloudstackRequest('listZones')
  return response.listzonesresponse?.zone || []
}

/**
 * List available service offerings (VM sizes/plans).
 */
export async function listServiceOfferings(): Promise<CloudStackServiceOffering[]> {
  const response = await cloudstackRequest('listServiceOfferings')
  return response.listserviceofferingsresponse?.serviceoffering || []
}

/**
 * List available VM templates.
 */
export async function listTemplates(zoneId?: string): Promise<CloudStackTemplate[]> {
  const params: Record<string, string> = { templatefilter: 'executable' }
  if (zoneId) params.zoneid = zoneId
  const response = await cloudstackRequest('listTemplates', params)
  return response.listtemplatesresponse?.template || []
}

/**
 * Deploy a Virtual Machine via CloudStack API.
 */
export async function deployVirtualMachine(options: DeployVMOptions): Promise<CloudStackVM> {
  const params: Record<string, string> = {
    templateid: options.templateId,
    serviceofferingid: options.serviceOfferingId,
    zoneid: options.zoneId,
    name: options.name,
    displayname: options.displayName || options.name,
  }
  if (options.keypair) params.keypair = options.keypair
  if (options.userdata) params.userdata = options.userdata
  if (options.networkIds && options.networkIds.length > 0) {
    params.networkids = options.networkIds.join(',')
  }

  const response = await cloudstackRequest('deployVirtualMachine', params)
  const deployResponse = response.deployvirtualmachineresponse

  // Handle async job response
  if (deployResponse?.jobid) {
    return {
      id: '',
      name: options.name,
      state: 'deploying',
      zoneid: options.zoneId,
      zonename: '',
      templateid: options.templateId,
      nic: [],
      jobid: deployResponse.jobid,
    }
  }

  const vm = deployResponse?.virtualmachine
  if (!vm) throw new Error('No VM returned from CloudStack deployVirtualMachine')
  return vm as CloudStackVM
}

/**
 * Query the status of an async job.
 */
export async function getAsyncJobResult(jobId: string): Promise<AsyncJobResult> {
  const response = await cloudstackRequest('queryAsyncJobResult', { jobid: jobId })
  const result = response.queryasyncjobresultresponse
  if (!result) throw new Error('Invalid async job result response')
  return result as AsyncJobResult
}

/**
 * Poll queryAsyncJobResult every intervalMs until VM is ready or timeout.
 */
export async function pollDeployment(
  jobId: string,
  maxAttempts = 24,
  intervalMs = 5000
): Promise<CloudStackVM> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getAsyncJobResult(jobId)
    if (result.jobstatus === 1) {
      const vm = (result.jobresult as Record<string, unknown>)?.virtualmachine
      if (!vm) throw new Error('No VM in async job result')
      return vm as CloudStackVM
    }
    if (result.jobstatus === 2) {
      throw new Error(
        `VM deployment failed: ${JSON.stringify(result.jobresult)}`
      )
    }
    // jobstatus === 0 means still pending — wait and retry
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error(`VM deployment timed out after ${maxAttempts} attempts`)
}

/**
 * Get details of a specific VM.
 */
export async function getVMDetails(vmId: string): Promise<CloudStackVM> {
  const response = await cloudstackRequest('listVirtualMachines', { id: vmId })
  const vms: CloudStackVM[] = response.listvirtualmachinesresponse?.virtualmachine || []
  if (vms.length === 0) throw new Error(`VM ${vmId} not found`)
  return vms[0]
}

/**
 * Get the primary IP address of a VM.
 */
export async function getVMIpAddress(vmId: string): Promise<string | null> {
  const vm = await getVMDetails(vmId)
  const defaultNic = vm.nic?.find((n) => n.isdefault) || vm.nic?.[0]
  return defaultNic?.ipaddress || null
}

/**
 * Stop a running VM. Returns the async job ID.
 */
export async function stopVirtualMachine(vmId: string): Promise<{ jobId: string }> {
  const response = await cloudstackRequest('stopVirtualMachine', { id: vmId })
  const jobid = response.stopvirtualmachineresponse?.jobid
  if (!jobid) throw new Error('No jobid returned from stopVirtualMachine')
  return { jobId: jobid }
}

/**
 * Start a stopped VM. Returns the async job ID.
 */
export async function startVirtualMachine(vmId: string): Promise<{ jobId: string }> {
  const response = await cloudstackRequest('startVirtualMachine', { id: vmId })
  const jobid = response.startvirtualmachineresponse?.jobid
  if (!jobid) throw new Error('No jobid returned from startVirtualMachine')
  return { jobId: jobid }
}

/**
 * Destroy (expunge) a VM. Returns the async job ID.
 */
export async function destroyVirtualMachine(vmId: string): Promise<{ jobId: string }> {
  const response = await cloudstackRequest('destroyVirtualMachine', {
    id: vmId,
    expunge: 'true',
  })
  const jobid = response.destroyvirtualmachineresponse?.jobid
  if (!jobid) throw new Error('No jobid returned from destroyVirtualMachine')
  return { jobId: jobid }
}

/**
 * List virtual machines for the account.
 */
export async function listVirtualMachines(zoneId?: string): Promise<CloudStackVM[]> {
  const params: Record<string, string> = {}
  if (zoneId) params.zoneid = zoneId
  const response = await cloudstackRequest('listVirtualMachines', params)
  return response.listvirtualmachinesresponse?.virtualmachine || []
}
