import type { FormKitSchemaFormKit } from '@formkit/core'
import type { WritableComputedRef } from 'vue'
import { computed, ref } from 'vue'
import { formSchema, selectedIndex, selectedKey } from '../utils/default-form-elements'
import { commitSchema } from './schema-history'

export const isLoading = ref(false)

type Found = { node: FormKitSchemaFormKit; path: number[]; rootIndex: number } | null

export const findSchemaNodeByKey = (schema: any[], key: string, path: number[] = [], rootIndex = -1): Found => {
  for (let i = 0; i < schema.length; i++) {
    const node = schema[i]
    if (!node || typeof node !== 'object') continue
    const nextPath = [...path, i]
    const nextRootIndex = rootIndex >= 0 ? rootIndex : i
    if ((node as any).__key === key) return { node, path: nextPath, rootIndex: nextRootIndex }
    const children = (node as any)?.children
    if (Array.isArray(children)) {
      const found = findSchemaNodeByKey(children, key, [...nextPath, -1], nextRootIndex)
      if (found) return found
    }
  }
  return null
}

const normalizePath = (path: number[]) => path.filter((p) => p !== -1)

const getNodeAtPath = (schema: any[], path: number[]) => {
  let cur: any = schema
  for (const idx of normalizePath(path)) {
    cur = Array.isArray(cur) ? cur[idx] : cur?.children?.[idx]
  }
  return cur as FormKitSchemaFormKit | undefined
}

const updateAtPath = (schema: any[], path: number[], nextNode: any): any[] => {
  const p = normalizePath(path)
  if (p.length === 0) return schema
  const nextSchema = [...schema]
  const idx0 = p[0]!
  if (p.length === 1) {
    nextSchema[idx0] = nextNode
    return nextSchema
  }
  const parent = { ...(nextSchema[idx0] as any) }
  let cursor: any = parent
  for (let i = 1; i < p.length - 1; i++) {
    const idx = p[i]!
    const arr = Array.isArray(cursor.children) ? [...cursor.children] : []
    const child = { ...(arr[idx] as any) }
    arr[idx] = child
    cursor.children = arr
    cursor = child
  }
  const lastIdx = p[p.length - 1]!
  const lastArr = Array.isArray(cursor.children) ? [...cursor.children] : []
  lastArr[lastIdx] = nextNode
  cursor.children = lastArr
  nextSchema[idx0] = parent
  return nextSchema
}

export const selectedField = computed(() => {
  const key = selectedKey.value
  if (key) {
    const found = findSchemaNodeByKey(formSchema.value as any[], key)
    if (found) return found.node
  }
  return formSchema.value[selectedIndex.value]
})

export type CanvasView = 'desktop' | 'tablet' | 'mobile'
export const canvasView = ref<CanvasView>('desktop')

type SchemaWithButtonProps = FormKitSchemaFormKit & {
  buttonProps?: Record<string, unknown>
}

type SchemaWithNaiveProps = FormKitSchemaFormKit & {
  naiveProps?: Record<string, unknown>
}

export function useFormField() {
  const normalizeName = (value: string) => {
    let name = value.trim().replace(/[^a-zA-Z0-9_]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '')
    if (!name) return ''
    if (/^\d/.test(name)) name = `field_${name}`
    return name
  }

  const setFieldProp = (key: string, value: unknown) => {
    if (formSchema.value.length > 0) {
      const selected = selectedKey.value
      const found = selected ? findSchemaNodeByKey(formSchema.value as any[], selected) : null
      const path = found?.path
      const currentNode = path ? getNodeAtPath(formSchema.value as any[], path) : formSchema.value[selectedIndex.value]
      if (!currentNode) return

      const current = { ...(currentNode as Record<string, unknown>) }
      if (value === undefined) {
        delete (current as any)[key]
      } else {
        ;(current as any)[key] = value
      }
      const nextSchema = path
        ? updateAtPath(formSchema.value as any[], path, current as FormKitSchemaFormKit)
        : (() => {
            const updatedSchema = [...formSchema.value]
            updatedSchema[selectedIndex.value] = current as FormKitSchemaFormKit
            return updatedSchema
          })()
      commitSchema(nextSchema as FormKitSchemaFormKit[], { reason: 'field-edit', merge: true })
    }
  }

  const setButtonProp = (key: string, value: unknown) => {
    if (formSchema.value.length > 0) {
      const selected = selectedKey.value
      const found = selected ? findSchemaNodeByKey(formSchema.value as any[], selected) : null
      const path = found?.path
      const current = (path ? getNodeAtPath(formSchema.value as any[], path) : formSchema.value[selectedIndex.value]) as SchemaWithButtonProps
      if (!current) return
      const nextButtonProps = {
        ...current?.buttonProps,
        [key]: value,
      }
      const nextNode = {
        ...current,
        buttonProps: nextButtonProps,
      } as FormKitSchemaFormKit
      const nextSchema = path
        ? updateAtPath(formSchema.value as any[], path, nextNode)
        : (() => {
            const updatedSchema = [...formSchema.value]
            updatedSchema[selectedIndex.value] = nextNode
            return updatedSchema
          })()
      commitSchema(nextSchema as FormKitSchemaFormKit[], { reason: 'field-edit', merge: true })
    }
  }

  const setNaiveProp = (key: string, value: unknown) => {
    if (formSchema.value.length > 0) {
      const selected = selectedKey.value
      const found = selected ? findSchemaNodeByKey(formSchema.value as any[], selected) : null
      const path = found?.path
      const current = (path ? getNodeAtPath(formSchema.value as any[], path) : formSchema.value[selectedIndex.value]) as SchemaWithNaiveProps
      if (!current) return
      const nextNaiveProps = {
        ...current?.naiveProps,
        [key]: value,
      }
      const nextNode = {
        ...current,
        naiveProps: nextNaiveProps,
      } as FormKitSchemaFormKit
      const nextSchema = path
        ? updateAtPath(formSchema.value as any[], path, nextNode)
        : (() => {
            const updatedSchema = [...formSchema.value]
            updatedSchema[selectedIndex.value] = nextNode
            return updatedSchema
          })()
      commitSchema(nextSchema as FormKitSchemaFormKit[], { reason: 'field-edit', merge: true })
    }
  }

  const createButtonProp = <T>(key: string, defaultValue: T): WritableComputedRef<T, T> => {
    return computed({
      get: () => {
        const current = selectedField.value as SchemaWithButtonProps
        const value = current?.buttonProps?.[key]
        return (value ?? defaultValue) as T
      },
      set: (value: T) => setButtonProp(key, value),
    })
  }

  const createNaiveProp = <T>(key: string, defaultValue: T): WritableComputedRef<T, T> => {
    return computed({
      get: () => {
        const current = selectedField.value as SchemaWithNaiveProps
        const value = current?.naiveProps?.[key]
        return (value ?? defaultValue) as T
      },
      set: (value: T) => setNaiveProp(key, value),
    })
  }

  const createValidationValue = (validationType: string, active: boolean = true) => {
    return computed({
      get: () => getParameterizedValidation(validationType),
      set: (value: string) => {
        updateValidationString(`${validationType}:${value}`, active)
      },
    })
  }

  const fieldName = computed({
    get: () => selectedField.value?.name || '',
    set: (newName: string) => {
      const nextName = normalizeName(newName)
      setFieldProp('name', nextName || undefined)
    },
  })

  const useExpressionValue = computed({
    get: () => {
      const current = selectedField.value as any
      return Boolean(current?.useExpressionValue)
    },
    set: (value: boolean) => setFieldProp('useExpressionValue', value ? true : undefined),
  })

  const valueExpression = computed<string>({
    get: () => {
      const current = selectedField.value as any
      const value = current?.__raw__valueExpression ?? current?.valueExpression
      if (typeof value !== 'string') return ''
      return value
    },
    set: (value: string) => {
      setFieldProp('__raw__valueExpression', value.trim() ? value : undefined)
      setFieldProp('valueExpression', undefined)
    },
  })

  const label = computed({
    get: () => selectedField.value?.label || '',
    set: (newLabel: string) => {
      if (formSchema.value.length > 0) {
        const updatedSchema = [...formSchema.value]
        updatedSchema[selectedIndex.value] = {
          ...updatedSchema[selectedIndex.value],
          label: newLabel,
        } as FormKitSchemaFormKit
        commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
      }
    },
  })

  const buttonText = computed<string>({
    get: () => {
      const current = selectedField.value as any
      const value = current?.buttonText
      if (typeof value !== 'string') return ''
      return value
    },
    set: (value: string) => {
      const next = value.trim()
      setFieldProp('buttonText', next ? next : undefined)
    },
  })

  const placeholder = computed({
    get: () => selectedField.value?.placeholder || '',
    set: (newPlaceholder: string) => {
      if (formSchema.value.length > 0) {
        const updatedSchema = [...formSchema.value]
        updatedSchema[selectedIndex.value] = {
          ...updatedSchema[selectedIndex.value],
          placeholder: newPlaceholder,
        } as FormKitSchemaFormKit
        commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
      }
    },
  })

  const fieldValue = computed<string>({
    get: () => {
      const current = selectedField.value as unknown as { value?: unknown }
      const value = current?.value
      if (value === null || value === undefined) return ''
      return String(value)
    },
    set: (newValue: string) => {
      setFieldProp('value', newValue === '' ? undefined : newValue)
    },
  })

  const validationString = computed({
    get: () => selectedField.value?.validation || '',
    set: (value: string) => {
      if (formSchema.value.length > 0) {
        const updatedSchema = [...formSchema.value]
        updatedSchema[selectedIndex.value] = {
          ...updatedSchema[selectedIndex.value],
          validation: value,
        } as FormKitSchemaFormKit
        commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
      }
    },
  })

  const validationStringLength = computed(() => {
    if (!validationString.value) return 0
    const validation = selectedField.value?.validation
    if (typeof validation !== 'string') return 0
    return validation.split('|').length
  })

  const updateValidationString = (value: string, active: boolean = true) => {
    const currentValidation = validationString.value.split('|').filter(Boolean)
    let newValidation: string[]

    if (!value.includes(':')) {
      if (currentValidation.includes(value)) {
        newValidation = currentValidation.filter((item: string) => item !== value)
      } else {
        newValidation = [...currentValidation, value]
      }
      validationString.value = newValidation.join('|')
      return
    } else {
      const [validationType, validationValue] = value.split(':')
      if (currentValidation.includes(value) && !active) {
        newValidation = currentValidation.filter((item: string) => item !== value)
      } else {
        const indexOfType = currentValidation.findIndex((item: string) =>
          item.startsWith(`${validationType}:`),
        )
        if (indexOfType === -1) {
          newValidation = [...currentValidation, value]
        } else {
          newValidation = [
            ...currentValidation.slice(0, indexOfType),
            `${validationType}:${validationValue}`,
            ...currentValidation.slice(indexOfType + 1),
          ]
        }
      }
      validationString.value = newValidation.join('|')
      return
    }
  }

  const isActive = (fn: (arg0: string) => boolean, strVal: string) => {
    return computed(() => fn(strVal))
  }

  const getParameterizedValidation = (validationType: string) => {
    if (!validationString.value) return ''

    const validations = validationString.value.split('|')
    const validation = validations.find((item: string) => item.startsWith(`${validationType}`))

    if (!validation) return ''

    return validation.replace(`${validationType}:`, '')
  }

  const help = computed({
    get: () => selectedField.value?.help || '',
    set: (newHelp: string) => {
      if (formSchema.value.length > 0) {
        const updatedSchema = [...formSchema.value]
        updatedSchema[selectedIndex.value] = {
          ...updatedSchema[selectedIndex.value],
          help: newHelp,
        } as FormKitSchemaFormKit
        commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
      }
    },
  })

  const whichNumber = computed<string>({
    get: () => selectedField.value?.number || 'integer',
    set: (value: string) => {
      if (value === 'integer') {
        if (formSchema.value.length > 0) {
          const updatedSchema = [...formSchema.value]
          updatedSchema[selectedIndex.value] = {
            ...updatedSchema[selectedIndex.value],
            number: value,
            step: '1',
          } as FormKitSchemaFormKit
          commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
        }
      } else {
        if (formSchema.value.length > 0) {
          const updatedSchema = [...formSchema.value]
          updatedSchema[selectedIndex.value] = {
            ...updatedSchema[selectedIndex.value],
            number: value,
            step: '0.1',
          } as FormKitSchemaFormKit
          commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
        }
      }
    },
  })

  const numOfFiles = computed({
    get: () => selectedField.value?.multiple || 'false',
    set: (value: string) => {
      if (formSchema.value.length > 0) {
        const updatedSchema = [...formSchema.value]
        updatedSchema[selectedIndex.value] = {
          ...updatedSchema[selectedIndex.value],
          multiple: value,
        } as FormKitSchemaFormKit
        commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
      }
    },
  })

  const modelValue = computed<string[]>({
    get: () => selectedField.value?.options || [],
    set: (newOptions: string[]) => {
      if (formSchema.value.length > 0) {
        const updatedSchema = [...formSchema.value]
        updatedSchema[selectedIndex.value] = {
          ...updatedSchema[selectedIndex.value],
          options: newOptions,
        } as FormKitSchemaFormKit
        commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
      }
    },
  })

  const optionsRaw = computed<unknown>({
    get: () => selectedField.value?.options ?? [],
    set: (newOptions: unknown) => {
      if (formSchema.value.length > 0) {
        const updatedSchema = [...formSchema.value]
        updatedSchema[selectedIndex.value] = {
          ...updatedSchema[selectedIndex.value],
          options: newOptions,
        } as FormKitSchemaFormKit
        commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
      }
    },
  })

  const min = computed<number | undefined>({
    get: () => selectedField.value?.min,
    set: (newMin: number | undefined) => {
      if (formSchema.value.length > 0) {
        const updatedSchema = [...formSchema.value]
        updatedSchema[selectedIndex.value] = {
          ...updatedSchema[selectedIndex.value],
          min: newMin,
        } as FormKitSchemaFormKit
        commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
      }
    },
  })

  const max = computed<number | undefined>({
    get: () => selectedField.value?.max,
    set: (newMax: number | undefined) => {
      if (formSchema.value.length > 0) {
        const updatedSchema = [...formSchema.value]
        updatedSchema[selectedIndex.value] = {
          ...updatedSchema[selectedIndex.value],
          max: newMax,
        } as FormKitSchemaFormKit
        commitSchema(updatedSchema, { reason: 'field-edit', merge: true })
      }
    },
  })

  const hasField = computed(() => !!formSchema.value[selectedIndex.value])

  const isValidationChecked = (validationType: string) => {
    if (!hasField.value) return false
    const validationStr = selectedField?.value?.validation
    if (!validationStr || typeof validationStr !== 'string') return false

    const validations = validationStr.split('|')
    return validations.some((validation: string) => {
      if (validation === validationType) return true

      const [type] = validation.split(':')
      return type === validationType
    })
  }

  const currentFieldType = computed(() => (hasField.value ? selectedField.value?.$formkit : null))

  const availableFieldNames = computed(() => {
    const extractNames = (schema: FormKitSchemaFormKit[]): string[] => {
      let names: string[] = []
      for (const field of schema) {
        if (field.name && typeof field.name === 'string') {
          names.push(field.name)
        }
        if (field.children && Array.isArray(field.children)) {
          names = names.concat(extractNames(field.children as FormKitSchemaFormKit[]))
        }
      }
      return names
    }
    return Array.from(new Set(extractNames(formSchema.value)))
  })

  const rowSpan = computed<number>({
    get: () => {
      const outerClass = selectedField.value?.outerClass
      if (typeof outerClass !== 'string') return 1
      const match = outerClass.match(/\brow-span-(\d+)\b/)
      return match ? parseInt(match[1]!, 10) : 1
    },
    set: (value: number) => {
      const nextSpan = Math.max(1, Math.min(6, Math.round(value)))
      const currentOuterClass = selectedField.value?.outerClass
      let classes = typeof currentOuterClass === 'string' ? currentOuterClass : ''

      if (nextSpan === 1) {
        classes = classes.replace(/\brow-span-\d+\b/g, '').replace(/\s+/g, ' ').trim()
      } else if (/\brow-span-\d+\b/.test(classes)) {
        classes = classes.replace(/\brow-span-\d+\b/g, `row-span-${nextSpan}`).replace(/\s+/g, ' ').trim()
      } else {
        classes = `${classes} row-span-${nextSpan}`.replace(/\s+/g, ' ').trim()
      }

      setFieldProp('outerClass', classes || undefined)
    },
  })

  return {
    fieldName,
    useExpressionValue,
    valueExpression,
    label,
    buttonText,
    placeholder,
    fieldValue,
    updateValidationString,
    isActive,
    createValidationValue,
    validationStringLength,
    currentFieldType,
    availableFieldNames,
    hasField,
    help,
    whichNumber,
    validationString,
    numOfFiles,
    modelValue,
    optionsRaw,
    min,
    max,
    isValidationChecked,
    createButtonProp,
    createNaiveProp,
    rowSpan,
  }
}
