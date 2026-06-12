 
import type { FormKitSchemaFormKit } from '@formkit/core'

// Generate a stable field key for identifying fields during drag-and-drop.
export const generateKey = () => {
  const uuid = globalThis.crypto?.randomUUID?.()
  if (uuid) return uuid
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

// Find a node by __key in the schema tree to read the latest values from the real schema.
export const findSchemaByKey = (schema: any[], key: string): any | undefined => {
  for (const node of schema) {
    if (node && typeof node === 'object' && (node as any).__key === key) return node
    const children = (node as any)?.children
    if (Array.isArray(children)) {
      const found = findSchemaByKey(children, key)
      if (found) return found
    }
  }
  return undefined
}

// Normalize a field name into a safe identifier.
export const toSafeName = (input: unknown) => {
  const raw = typeof input === 'string' ? input : ''
  let name = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
  if (!name) name = 'field'
  if (/^\d/.test(name)) name = `field_${name}`
  return name
}

// Recursively collect existing names in the schema to avoid name collisions.
export const collectSchemaNames = (schema: FormKitSchemaFormKit[], names: Set<string>) => {
  for (const field of schema) {
    if (typeof field?.name === 'string' && field.name) names.add(field.name)
    const children = (field as any)?.children
    if (Array.isArray(children)) collectSchemaNames(children as FormKitSchemaFormKit[], names)
  }
}

// Generate a unique name, such as name, name_1, name_2.
export const ensureUniqueName = (base: string, existing: Set<string>) => {
  let name = base
  let i = 1
  while (existing.has(name)) {
    name = `${base}_${i}`
    i++
  }
  existing.add(name)
  return name
}
