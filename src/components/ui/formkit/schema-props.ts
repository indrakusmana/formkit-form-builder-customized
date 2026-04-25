import type { FormKitFrameworkContext } from '@formkit/core'

export function getSchemaProps(ctx: FormKitFrameworkContext): Record<string, unknown> {
  const attrsBag = (ctx as any)?.attrs?.props
  if (attrsBag && typeof attrsBag === 'object') return attrsBag as Record<string, unknown>
  const nodeProps = (ctx as any)?.node?.props ?? {}
  const bag = (nodeProps as any).props
  if (!bag || typeof bag !== 'object') return {}
  return bag as Record<string, unknown>
}
