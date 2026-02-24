import fs from 'fs'
import path from 'path'

/**
 * Encodes a cloud-init YAML string to base64 for the CloudStack userdata param.
 */
export function encodeUserdata(yamlContent: string): string {
  return Buffer.from(yamlContent).toString('base64')
}

/**
 * Reads a cloud-init YAML from cloudstack/templates/{appSlug}/cloud-init.yaml
 * and returns its base64-encoded content, or undefined if the file does not exist.
 */
export function getUserdataForApp(appSlug: string): string | undefined {
  // Resolve relative to the project root (two levels up from backend/src/utils)
  const templatePath = path.resolve(
    __dirname,
    '../../../../cloudstack/templates',
    appSlug,
    'cloud-init.yaml'
  )

  if (!fs.existsSync(templatePath)) {
    return undefined
  }

  const content = fs.readFileSync(templatePath, 'utf-8')
  return encodeUserdata(content)
}
