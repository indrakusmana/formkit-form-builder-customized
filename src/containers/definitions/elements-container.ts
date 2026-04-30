import type { FormKitSchemaFormKit } from '@formkit/core'
import type { ContainerDefinition, SchemaNode } from '../types'
import ElementsContainer from '@/components/ui/containers/elements/ElementsContainer.vue'
import ElementsContainerPreview from '@/components/ui/containers/elements/ElementsContainerPreview.vue'

function isElementsContainer(node: any) {
  if (!node || typeof node !== 'object') return false
  return node.$cmp === 'elementsContainer'
}

function normalize(node: SchemaNode): SchemaNode {
  const next: any = { ...node }
  next.$cmp = next.$cmp || 'elementsContainer'
  next.children = Array.isArray(next.children) ? next.children : []
  const props = typeof next.props === 'object' && next.props ? { ...next.props } : {}
  props.elementsKey = typeof props.elementsKey === 'string' && props.elementsKey ? props.elementsKey : (next.__key as string | undefined) ?? ''
  props.modelValue = next.children
  if (props.dndEnabled === undefined) props.dndEnabled = true
  if (props.useDragHandle === undefined) props.useDragHandle = false
  next.props = props
  return next
}

export const elementsContainerDef: ContainerDefinition = {
  id: 'elementsContainer',
  match: isElementsContainer,
  canvas: { libraryKey: 'elementsContainer', component: ElementsContainer as any },
  preview: { libraryKey: 'elementsContainer', component: ElementsContainerPreview as any },
  normalize,
  formatPreview: (node, ctx) => {
    const key = (node as any)?.__key as string | undefined
    const normalized = normalize(node)
    const children = Array.isArray(normalized.children)
      ? (normalized.children as FormKitSchemaFormKit[]).map((c, i) => ctx.format(c, i))
      : []
    const schemaIf = (normalized as any).if
    const nextNode: any = {
      $el: 'div',
      attrs: { class: (normalized as any).outerClass || 'col-span-12' },
      children: [
        {
          $cmp: 'elementsContainer',
          props: {
            ...(normalized as any).props,
            elementsKey: ((normalized as any).props?.elementsKey as string | undefined) ?? key ?? '',
            modelValue: children,
            isPlaceholder: ctx.isPlaceholder,
          },
        },
      ],
    }
    if (typeof schemaIf === 'string' && schemaIf.trim()) nextNode.if = schemaIf
    else if (typeof schemaIf === 'boolean') nextNode.if = schemaIf
    return nextNode as FormKitSchemaFormKit
  },
}

