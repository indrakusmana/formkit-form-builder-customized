import type { FormKitFrameworkContext } from '@formkit/core'

export function getSchemaProps(ctx: FormKitFrameworkContext): Record<string, unknown> {
  const nodeProps = (ctx?.node?.props ?? {}) as Record<string, unknown>
  const bag = nodeProps.props
  if (!bag || typeof bag !== 'object') return {}
  return bag as Record<string, unknown>
}

