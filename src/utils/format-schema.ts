import { computed, type Ref } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'

export default function createFormattedSchema(fields: Ref<FormKitSchemaFormKit[]> | undefined) {
  return computed(() => {
    if (!fields) return []
    const formatOne = (field: FormKitSchemaFormKit, index: number): any => {
      const key = (field as any)?.__key as string | undefined
      const isPreviewPlaceholder = (field as any)?.__preview_placeholder === true
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
        naiveProps,
        min,
        max,
        validationVisibility,
        __raw__sectionsSchema,
        step,
        multiple,
        accept,
      } = field

      if ($formkit === 'list') {
        const children = Array.isArray((field as any)?.children)
          ? ((field as any).children as FormKitSchemaFormKit[]).map((c, i) => formatOne(c, i))
          : []
        return {
          $el: 'div',
          attrs: { class: outerClass || 'col-span-12' },
          children: [
            {
              $cmp: 'ListContainerPreview',
              props: { nodeKey: key, children, label, isPlaceholder: isPreviewPlaceholder },
            },
          ],
        }
      }

      const cleanField: FormKitSchemaFormKit = {
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
        naiveProps,
        number,
        min,
        max,
        validationVisibility,
        __raw__sectionsSchema,
        step,
        multiple,
        accept,
      }

      if (options) cleanField.options = options
      return cleanField
    }

    return fields.value.map((field, index) => formatOne(field, index))
  })
}
