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

export async function runBindCode(code: string, event: unknown, data?: unknown, someAttributes?: unknown) {
  const runner = new Function(
    'axios',
    'event',
    'data',
    'someAttributes',
    `"use strict"; return (async () => { ${code}\n})()`,
  )
  const attrs = someAttributes ?? (data as any)?.someAttributes
  return await (runner as any)(axios, event, data, attrs)
}
