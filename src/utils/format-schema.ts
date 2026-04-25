import { computed, type Ref } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { ensureContainerCmpNode } from './schema/containers'

export default function createFormattedSchema(fields: Ref<FormKitSchemaFormKit[]> | undefined) {
  return computed(() => {
    if (!fields) return []
    const formatOne = (field: FormKitSchemaFormKit, index: number): any => {
      const key = (field as any)?.__key as string | undefined
      const isPreviewPlaceholder = (field as any)?.__preview_placeholder === true
      const normalized: any = ensureContainerCmpNode(field as any)
      if (normalized?.$cmp === 'ListContainer') {
        const children = Array.isArray(normalized.children)
          ? (normalized.children as FormKitSchemaFormKit[]).map((c, i) => formatOne(c, i))
          : []
        const schemaIf = normalized.if
        const nextNode: any = {
          $el: 'div',
          attrs: { class: normalized.outerClass || 'col-span-12' },
          children: [
            {
              $cmp: 'ListContainer',
              props: {
                ...(normalized.props ?? {}),
                listKey: (normalized.props?.listKey as string | undefined) ?? key ?? '',
                modelValue: children,
                isPlaceholder: isPreviewPlaceholder,
              },
            },
          ],
        }
        if (typeof schemaIf === 'string' && schemaIf.trim()) nextNode.if = schemaIf
        else if (typeof schemaIf === 'boolean') nextNode.if = schemaIf
        return nextNode
      }
      if (normalized?.$cmp === 'CardContainer') {
        const children = Array.isArray(normalized.children)
          ? (normalized.children as FormKitSchemaFormKit[]).map((c, i) => formatOne(c, i))
          : []
        const schemaIf = normalized.if
        const nextNode: any = {
          $el: 'div',
          attrs: { class: normalized.outerClass || 'col-span-12' },
          children: [
            {
              $cmp: 'CardContainer',
              props: {
                ...(normalized.props ?? {}),
                cardKey: (normalized.props?.cardKey as string | undefined) ?? key ?? '',
                modelValue: children,
              },
            },
          ],
        }
        if (typeof schemaIf === 'string' && schemaIf.trim()) nextNode.if = schemaIf
        else if (typeof schemaIf === 'boolean') nextNode.if = schemaIf
        return nextNode
      }
      const {
        $formkit,
        label,
        validation,
        help,
        placeholder,
        value,
        options,
        number,
        outerClass,
        type,
        buttonProps,
        buttonText,
        props,
        min,
        max,
        validationVisibility,
        __raw__sectionsSchema,
        step,
        multiple,
        accept,
        if: schemaIf,
      } = field

      const cleanField: any = {
        $formkit,
        name: field.name || (key ? `field_${key}` : `field_${index}`),
        id: field.id || (key ? `preview_field_${key}` : `preview_field_${index}`),
        label,
        validation,
        help,
        placeholder,
        value,
        options,
        outerClass,
        type,
        buttonProps,
        buttonText,
        props,
        number,
        min,
        max,
        validationVisibility,
        __raw__sectionsSchema,
        step,
        multiple,
        accept,
      }
      if (typeof schemaIf === 'string' && schemaIf.trim()) cleanField.if = schemaIf
      else if (typeof schemaIf === 'boolean') cleanField.if = schemaIf
      return cleanField
    }

    return fields.value.map((field, index) => formatOne(field, index))
  })
}
