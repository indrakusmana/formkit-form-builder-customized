<!-- src/components/form-builder/BuilderPreview.vue -->
<template>
  <n-modal
    v-model:show="isOpen"
    preset="card"
    :class="[
      'max-h-[90vh] overflow-y-auto border-none transition-all duration-300',
      canvasView === 'desktop' ? 'sm:max-w-[800px]' : '',
      canvasView === 'tablet' ? 'sm:max-w-[768px]' : '',
      canvasView === 'mobile' ? 'sm:max-w-[375px]' : ''
    ]"
    :title="t('builder.previewTitle')"
    size="small"
  >
    <template #header-extra>
      <div class="text-[11px] text-muted-foreground">
        {{ t('builder.previewDescription') }}
      </div>
    </template>
    <div class="py-4 px-3">
      <FormKit
        type="form"
        :actions="false"
        v-model="data"
        @submit="handleSubmit"
        form-class="w-full !grid !grid-cols-12 gap-x-4 gap-y-2"
      >
        <FormKitSchema :schema="formattedSchema" :data="data" :library="schemaLibrary" />
      </FormKit>
      <div class="mt-4 p-3 bg-muted/30 rounded border border-border/50">
        <h3 class="text-[11px] font-medium mb-2 text-foreground/80">{{ t('builder.formDataTitle') }}</h3>

        <pre class="text-[11px] text-muted-foreground">{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, provide, ref, watchEffect } from 'vue'
import { NModal } from 'naive-ui'
import { formSchema } from '../utils/default-form-elements'
import createFormattedSchema from '../utils/format-schema'
import { canvasView } from '../composables/form-fields'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { evalExpression } from '../utils/expression-eval'
import { useFormBuilderI18n } from '../i18n/context'
import { CardContainerPreview, ListContainerPreview } from './containers'
import { collectSchemaNames, ensureUniqueName, generateKey, toSafeName } from '../utils/dnd/schema'
import { findSchemaNodeByKey } from '../composables/form-fields'

const { t } = useFormBuilderI18n()

const isOpen = ref(false)
const data = ref({})
const previewSchema = ref<FormKitSchemaFormKit[]>([])
const formattedSchema = createFormattedSchema(previewSchema)
const schemaLibrary = computed(() => ({ ListContainerPreview, CardContainerPreview }))

provide('isPreviewOpen', isOpen)

const normalizePath = (path: number[]) => path.filter((p) => p !== -1)

const getParentArrayAtPath = (schema: any[], path: number[]) => {
  const p = normalizePath(path)
  if (p.length === 0) return null
  if (p.length === 1) return { parentArr: schema, index: p[0]!, parentNode: null as any }
  let cursor: any = schema[p[0]!]
  for (let i = 1; i < p.length - 1; i++) {
    cursor = cursor?.children?.[p[i]!]
  }
  const parentArr = Array.isArray(cursor?.children) ? cursor.children : null
  return parentArr ? { parentArr, index: p[p.length - 1]!, parentNode: cursor } : null
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

const removeAtPath = (schema: any[], path: number[]) => {
  const info = getParentArrayAtPath(schema, path)
  if (!info) return schema
  const { parentArr, index, parentNode } = info
  const nextArr = parentArr.filter((_: any, i: number) => i !== index)
  if (!parentNode) return nextArr
  const nextParent = { ...(parentNode as any), children: nextArr }
  return updateAtPath(schema, path.slice(0, -1), nextParent)
}

const insertAfterAtPath = (schema: any[], path: number[], nextNode: any) => {
  const info = getParentArrayAtPath(schema, path)
  if (!info) return schema
  const { parentArr, index, parentNode } = info
  const nextArr = [...parentArr]
  nextArr.splice(index + 1, 0, nextNode)
  if (!parentNode) return nextArr
  const nextParent = { ...(parentNode as any), children: nextArr }
  return updateAtPath(schema, path.slice(0, -1), nextParent)
}

const cloneNodeWithFreshIdentity = (node: any, existingNames: Set<string>) => {
  if (!node || typeof node !== 'object') return node
  const nextKey = generateKey()
  const base = toSafeName(node.name || node.$formkit || 'field')
  const nextName = node.$formkit === 'submit' ? node.name : ensureUniqueName(base, existingNames)
  const next: any = { ...node, __key: nextKey }
  if (node.$formkit !== 'submit') {
    next.name = nextName
    next.id = `field_${nextKey}`
  }
  if (Array.isArray(node.children)) {
    next.children = node.children.map((c: any) => cloneNodeWithFreshIdentity(c, existingNames))
  }
  return next
}

provide(
  'previewListDuplicate',
  (key: string) => {
    const found = findSchemaNodeByKey(previewSchema.value as any[], key)
    if (!found) return
    const existingNames = new Set<string>()
    collectSchemaNamesSafe(previewSchema.value as any, existingNames)
    const cloned = cloneNodeWithFreshIdentity(safeClone(found.node as any), existingNames)
    previewSchema.value = insertAfterAtPath(previewSchema.value as any[], found.path, cloned) as any
  },
)

provide(
  'previewListRemove',
  (key: string) => {
    const found = findSchemaNodeByKey(previewSchema.value as any[], key)
    if (!found) return
    const hasOtherList = (() => {
      const walk = (nodes: any[]): boolean => {
        for (const node of nodes) {
          if (!node || typeof node !== 'object') continue
          if (node.$formkit === 'list' && node.__key !== key && (node as any).__preview_placeholder !== true) return true
          const children = (node as any)?.children
          if (Array.isArray(children) && walk(children)) return true
        }
        return false
      }
      return walk(previewSchema.value as any[])
    })()

    if (!hasOtherList) {
      const current: any = found.node as any
      const nextNode: any = { ...current, __preview_placeholder: true }
      previewSchema.value = updateAtPath(previewSchema.value as any[], found.path, nextNode) as any
      return
    }

    previewSchema.value = removeAtPath(previewSchema.value as any[], found.path) as any
  },
)

provide(
  'previewListRestore',
  (key: string) => {
    const found = findSchemaNodeByKey(previewSchema.value as any[], key)
    if (!found) return
    const current: any = found.node as any
    const { __preview_placeholder, ...rest } = current
    const nextNode: any = { ...rest, children: Array.isArray(current.children) ? current.children : [] }
    previewSchema.value = updateAtPath(previewSchema.value as any[], found.path, nextNode) as any
  },
)

const lastComputedValueByName = ref<Record<string, string>>({})
const lastDepsSigByName = ref<Record<string, string>>({})

const safeClone = <T,>(value: T): T => {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

const eachField = (schema: FormKitSchemaFormKit[], fn: (field: any) => void) => {
  for (const field of schema) {
    fn(field)
    const children = (field as any)?.children
    if (Array.isArray(children)) eachField(children as FormKitSchemaFormKit[], fn)
  }
}

const collectSchemaNamesSafe = (schema: FormKitSchemaFormKit[], names: Set<string>) => {
  collectSchemaNames(schema, names)
  eachField(schema, (field) => {
    const raw = field?.name
    if (typeof raw !== 'string' || !raw) return
    names.add(toSafeName(raw))
  })
}

watchEffect(() => {
  const currentData = data.value as Record<string, unknown>
  let nextData: Record<string, unknown> | null = null
  eachField(previewSchema.value as FormKitSchemaFormKit[], (field) => {
    if (!field || typeof field !== 'object') return
    if (!field.useExpressionValue) return
    if (typeof field.name !== 'string' || !field.name) return
    const expr = (field as any)?.__raw__valueExpression ?? (field as any)?.valueExpression
    if (typeof expr !== 'string' || !expr.trim()) return

    const evalResult = evalExpression(expr, currentData)
    const depsSig = evalResult.deps
      .filter((k) => k !== field.name)
      .map((k) => `${k}:${String(currentData[k] ?? '')}`)
      .join('|')
    if (lastDepsSigByName.value[field.name] === depsSig) return
    lastDepsSigByName.value = { ...lastDepsSigByName.value, [field.name]: depsSig }

    if (!evalResult.ok) return
    const result = evalResult.value === null || evalResult.value === undefined ? '' : String(evalResult.value)

    const currentValue = currentData[field.name]
    const lastComputedValue = lastComputedValueByName.value[field.name]
    const shouldApply =
      currentValue === null ||
      currentValue === undefined ||
      String(currentValue) === '' ||
      (lastComputedValue !== undefined && String(currentValue) === lastComputedValue)

    if (shouldApply && String(currentValue ?? '') !== result) {
      if (!nextData) nextData = { ...currentData }
      nextData[field.name] = result
      lastComputedValueByName.value = { ...lastComputedValueByName.value, [field.name]: result }
    }
  })

  if (nextData) data.value = nextData
})

const handleSubmit = async (formData: Record<string, unknown>) => {
  console.log('Form submitted:', formData)
  await new Promise((r) => setTimeout(r, 1000))
  alert(t('builder.formSubmitted'))
  data.value = {}
}

const open = () => {
  isOpen.value = true
  data.value = {}
  previewSchema.value = safeClone(formSchema.value)
  lastComputedValueByName.value = {}
  lastDepsSigByName.value = {}
}

const close = () => {
  isOpen.value = false
  data.value = {}
  previewSchema.value = []
  lastComputedValueByName.value = {}
  lastDepsSigByName.value = {}
}

defineExpose({
  open,
  close,
})
</script>
