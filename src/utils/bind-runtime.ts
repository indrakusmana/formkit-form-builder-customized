import axios from 'axios'

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
