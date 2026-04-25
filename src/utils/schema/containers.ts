import type { FormKitSchemaFormKit } from '@formkit/core'

export type ContainerKind = 'list' | 'card'

export function getContainerKind(node: unknown): ContainerKind | null {
  const n: any = node as any
  if (!n || typeof n !== 'object') return null

  if (n.$formkit === 'list') return 'list'
  if (n.$formkit === 'card') return 'card'

  if (n.$cmp === 'list') return 'list'
  if (n.$cmp === 'card') return 'card'
  if (n.$cmp === 'ListContainer') return 'list'
  if (n.$cmp === 'CardContainer') return 'card'

  return null
}

export function getContainerKey(node: unknown): string | undefined {
  const n: any = node as any
  if (!n || typeof n !== 'object') return undefined
  const raw = n.__key
  return typeof raw === 'string' && raw ? raw : undefined
}

export function getContainerChildren(node: unknown): FormKitSchemaFormKit[] {
  const n: any = node as any
  const children = n?.children
  return Array.isArray(children) ? (children as FormKitSchemaFormKit[]) : []
}

export function ensureContainerCmpNode(node: any): any {
  if (!node || typeof node !== 'object') return node
  const kind = getContainerKind(node)
  if (!kind) return node
  const key = getContainerKey(node)
  const children = getContainerChildren(node)
  if (typeof node.$cmp === 'string' && node.$cmp) {
    const next = { ...node, $cmp: kind }
    next.props = { ...(typeof next.props === 'object' && next.props ? next.props : {}) }
    if (kind === 'list') {
      next.props.listKey = next.props.listKey ?? key ?? ''
      next.props.modelValue = children
    } else {
      next.props.cardKey = next.props.cardKey ?? key ?? ''
      next.props.modelValue = children
      if (next.props.help === undefined && (next as any).help !== undefined) {
        next.props.help = (next as any).help
        delete (next as any).help
      }
    }
    return next
  }

  const next = { ...node }
  if (kind === 'list') {
    delete next.$formkit
    next.$cmp = 'list'
    next.props = {
      ...(typeof next.props === 'object' && next.props ? next.props : {}),
      listKey: key ?? '',
      label: next.label,
      showActions: false,
      modelValue: children,
    }
    delete next.label
    return next
  }

  delete next.$formkit
  next.$cmp = 'card'
  next.props = {
    ...(typeof next.props === 'object' && next.props ? next.props : {}),
    cardKey: key ?? '',
    label: next.label,
    help: next.help,
    modelValue: children,
  }
  delete next.label
  delete next.help
  return next
}
