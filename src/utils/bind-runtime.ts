import axios from 'axios'
import type { FormKitFrameworkContext } from '@formkit/core'
import { getNode } from '@formkit/core'

type BindJs = { __js: string }

const allowedEventKeys = new Set(['onClick', 'onChange', 'onInput', 'onFocus', 'onBlur'])

function extractCode(v: unknown): string | undefined {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && typeof (v as any).__js === 'string') return (v as BindJs).__js
  return undefined
}

export function normalizeBind(bind: unknown): Record<string, string> | undefined {
  if (!bind || typeof bind !== 'object') return undefined
  const obj = bind as Record<string, unknown>
  const out: Record<string, string> = {}
  for (const key of Object.keys(obj)) {
    if (!allowedEventKeys.has(key)) continue
    const code = extractCode(obj[key])
    if (typeof code === 'string' && code.trim()) out[key] = code
  }
  return Object.keys(out).length ? out : undefined
}

export type BindRuntimeCtx = {
  event?: unknown
  data?: unknown
  attrs?: unknown
  $?: unknown
  [key: string]: unknown
}

export function createSchemaRuntimeContext(
  ctx: FormKitFrameworkContext,
  event?: unknown,
  extra?: Record<string, unknown>,
) {
  const node: any = (ctx as any)?.node
  const form = (node?.root?.value ?? {}) as any
  const value = (ctx as any)?._value ?? node?.value
  const slots = (ctx as any)?.slots ?? node?.context?.slots
  const props = (node?.props?.props ?? {}) as any
  const $get = (name: string) => {
    const at = node?.root?.at
    if (typeof at === 'function') return at.call(node.root, name)?.value
    const byName = getNode(name)
    if (byName) return (byName as any).value
    return form?.[name]
  }

  const runtime: Record<string, unknown> = {
    $value: value,
    $form: form,
    $node: node,
    $get,
    $slots: slots,
    $props: props,
    ...extra,
  }

  return runtime
}

export async function runBindCode(code: string, ctx: BindRuntimeCtx) {
  const runner = new Function(
    'ctx',
    'axios',
    `"use strict";
const event = ctx?.event;
const data = ctx?.data;
const attrs = ctx?.attrs;
const $ = ctx?.$;
return (async (ctx) => { ${code}\n})(ctx)`,
  )
  const fullCtx = { ...ctx, $: ctx.$ ?? ctx.data }
  return await (runner as any)(fullCtx, axios)
}
