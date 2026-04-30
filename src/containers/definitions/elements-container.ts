import type { FormKitSchemaFormKit } from '@formkit/core'
import type { ContainerDefinition, SchemaNode } from '../types'
import ListContainer from '@/components/ui/containers/list/ListContainer.vue'

function isElementsContainer(node: any) {
  if (!node || typeof node !== 'object') return false
  return node.$cmp === 'elementsContainer'
}

function normalize(node: SchemaNode): SchemaNode {
  const next: any = { ...node }
  next.$cmp = next.$cmp || 'elementsContainer'
  next.children = Array.isArray(next.children) ? next.children : []
  const props = typeof next.props === 'object' && next.props ? { ...next.props } : {}
  props.listKey = typeof props.listKey === 'string' && props.listKey ? props.listKey : (next.__key as string | undefined) ?? ''
  props.modelValue = next.children
  if (props.showActions === undefined) props.showActions = false
  next.props = props
  return next
}

export const elementsContainerDef: ContainerDefinition = {
  id: 'elementsContainer',
  match: isElementsContainer,
  canvas: { libraryKey: 'elementsContainer', component: ListContainer as any },
  normalize,
  formatPreview: (node, ctx) => {
    const key = (node as any)?.__key as string | undefined
    const normalized = normalize(node)
    const children = Array.isArray(normalized.children)
      ? (normalized.children as FormKitSchemaFormKit[]).map((c, i) => ctx.format(c, i))
      : []
    const schemaIf = (normalized as any).if
    const label = ((normalized as any)?.props?.label as string | undefined) ?? ''
    const name = (key && key.trim() ? key.trim() : 'elements') as string
    const nextNode: any = {
      $el: 'div',
      attrs: { class: (normalized as any).outerClass || 'col-span-12' },
      children: [
        {
          $formkit: 'repeater',
          name,
          label: label && label.trim() ? label.trim() : undefined,
          value: [{}],
          children,
        },
      ],
    }
    if (typeof schemaIf === 'string' && schemaIf.trim()) nextNode.if = schemaIf
    else if (typeof schemaIf === 'boolean') nextNode.if = schemaIf
    return nextNode as FormKitSchemaFormKit
  },
}
