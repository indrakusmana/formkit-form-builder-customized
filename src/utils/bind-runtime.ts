import axios from 'axios'

type BindJs = { __js: string }

function isBindJs(v: unknown): v is BindJs {
  return Boolean(v && typeof v === 'object' && typeof (v as any).__js === 'string')
}

export function compileBind(bind: unknown): Record<string, unknown> | undefined {
  if (!bind || typeof bind !== 'object') return undefined
  const obj = bind as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (isBindJs(v)) {
      const code = v.__js
      out[k] = async (event: unknown) => {
        try {
          const runner = new Function('axios', 'event', `"use strict"; return (async () => { ${code}\n})()`)
          return await (runner as any)(axios, event)
        } catch (e) {
          console.error(e)
        }
      }
      continue
    }
    out[k] = v
  }
  return Object.keys(out).length ? out : undefined
}

