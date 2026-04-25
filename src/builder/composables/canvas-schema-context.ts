import { inject, provide } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'

export type CanvasSchemaContext = {
  library: Record<string, unknown>
  renderNode: (node: unknown) => unknown
  updateContainerChildren?: (containerKey: string, children: FormKitSchemaFormKit[]) => void
  selectByKey?: (key: string) => void
}

const key: unique symbol = Symbol('canvas-schema-context')

export function provideCanvasSchemaContext(ctx: CanvasSchemaContext) {
  provide(key, ctx)
}

export function useCanvasSchemaContext() {
  return inject<CanvasSchemaContext | null>(key, null)
}
