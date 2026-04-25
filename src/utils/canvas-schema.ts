import type { FormKitSchemaFormKit } from '@formkit/core'
import { normalizeBind } from './bind-runtime'

function safeVar(value: unknown) {
  const raw = String(value ?? '')
  const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, '_')
  const start = cleaned.match(/^[a-zA-Z_]/) ? cleaned : `k_${cleaned}`
  return start || 'k_bind'
}

export function toCanvasSchemaNode(node: FormKitSchemaFormKit): FormKitSchemaFormKit {
  const anyNode: any = node as any
  if (!anyNode || typeof anyNode !== 'object') return node
  const next: any = { ...anyNode }
  if ('if' in next) delete next.if
  if ('__raw__ifExpression' in next) delete next.__raw__ifExpression
  if ('bind' in next && typeof next.bind !== 'string') {
    if (!next.__bind) next.__bind = normalizeBind(next.bind)
    delete next.bind
  }
  if (typeof next.__bind === 'object' && next.__bind) {
    const key = safeVar(next.__key || next.name || next.$formkit || next.$el)
    next.bind = `$bind_${key}`
  }
  if (Array.isArray(next.children)) {
    next.children = next.children.map((c: any) => toCanvasSchemaNode(c))
  }
  return next as FormKitSchemaFormKit
}
