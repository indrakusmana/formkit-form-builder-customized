import { inject, provide } from 'vue'

export type CanvasSchemaContext = {
  library: Record<string, unknown>
  renderNode: (node: unknown) => unknown
}

const key: unique symbol = Symbol('canvas-schema-context')

export function provideCanvasSchemaContext(ctx: CanvasSchemaContext) {
  provide(key, ctx)
}

export function useCanvasSchemaContext() {
  return inject<CanvasSchemaContext | null>(key, null)
}

