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

        <pre class="text-[11px] text-muted-foreground">{{ prettyData }}</pre>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, provide, reactive, ref, watchEffect } from 'vue'
import { NModal } from 'naive-ui'
import { formSchema } from '../utils/default-form-elements'
import createFormattedSchema from '../utils/format-schema'
import { canvasView } from '../composables/form-fields'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { evalExpression } from '../utils/expression-eval'
import { useFormBuilderI18n } from '../i18n/context'
import { previewSchemaLibrary } from './containers'
import { collectSchemaNames, generateKey, toSafeName } from '../utils/dnd/schema'
import { findSchemaNodeByKey } from '../composables/form-fields'
import { getContainerKind } from '../utils/schema/containers'
import { runBindCode } from '../utils/bind-runtime'

const { t } = useFormBuilderI18n()

const isOpen = ref(false)
const data = ref({})
const previewSchema = ref<FormKitSchemaFormKit[]>([])
const previewListItemSeq = ref<Record<string, number>>({})
const formattedSchema = createFormattedSchema(previewSchema)
const schemaLibrary = previewSchemaLibrary
const previewRuntimeData = ref<Record<string, unknown>>({})

provide('isPreviewOpen', isOpen)

const prettyData = computed(() =>
  JSON.stringify(
    data.value,
    (_k, v) => {
      if (typeof v === 'function') return '[Function]'
      return v
    },
    2,
  ),
)

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

const canonicalBaseName = (value: unknown) => {
  const safe = toSafeName(value)
  const match = safe.match(/^(.*_\d+)_\d+$/)
  return match?.[1] || safe
}

const isStructureNode = (node: any) => {
  const kind = getContainerKind(node)
  if (kind) return true
  return ['group'].includes(String(node?.$formkit ?? ''))
}

const collectLeafBases = (node: any, bases: Set<string>) => {
  if (!node || typeof node !== 'object') return
  if (!isStructureNode(node) && node.$formkit !== 'submit') {
    const rawName = node.name || node.$formkit || node.$cmp || 'field'
    const base = canonicalBaseName(rawName)
    if (base) bases.add(base)
  }
  if (Array.isArray(node.children)) {
    for (const c of node.children) collectLeafBases(c, bases)
  }
}

const cloneNodeWithFreshIdentity = (node: any, existingNames: Set<string>, listSuffix: number) => {
  if (!node || typeof node !== 'object') return node
  const nextKey = generateKey()
  const next: any = { ...node, __key: nextKey }
  const kind = getContainerKind(node)
  if (node.$formkit !== 'submit') {
    if (!isStructureNode(node)) {
      const rawName = node.name || node.$formkit || node.$cmp || 'field'
      const base = canonicalBaseName(rawName)
      let candidate = listSuffix > 0 ? `${base}_${listSuffix}` : base
      let i = 1
      while (existingNames.has(candidate)) {
        candidate = `${base}_${listSuffix}_${i}`
        i++
      }
      next.name = candidate
      existingNames.add(candidate)
      existingNames.add(toSafeName(candidate))
    }
    next.id = `field_${nextKey}`
  }
  if (Array.isArray(node.children)) {
    next.children = node.children.map((c: any) => cloneNodeWithFreshIdentity(c, existingNames, listSuffix))
  }
  if (kind) {
    const baseProps = typeof next.props === 'object' && next.props ? next.props : {}
    if (kind === 'list') {
      next.props = { ...baseProps, listKey: nextKey, modelValue: Array.isArray(next.children) ? next.children : [] }
    } else {
      next.props = { ...baseProps, cardKey: nextKey, modelValue: Array.isArray(next.children) ? next.children : [] }
    }
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
    const bases = new Set<string>()
    collectLeafBases(found.node as any, bases)
    let nextSuffix = (previewListItemSeq.value[key] ?? 0) + 1
    const isFree = (suffix: number) => {
      for (const base of bases) {
        const candidate = `${base}_${suffix}`
        if (existingNames.has(candidate) || existingNames.has(toSafeName(candidate))) return false
      }
      return true
    }
    while (!isFree(nextSuffix)) nextSuffix++
    previewListItemSeq.value = { ...previewListItemSeq.value, [key]: nextSuffix }
    const cloned = cloneNodeWithFreshIdentity(safeClone(found.node as any), existingNames, nextSuffix)
    previewSchema.value = insertAfterAtPath(previewSchema.value as any[], found.path, cloned) as any
  },
)

provide(
  'previewListIsLast',
  (key: string) => {
    const found = findSchemaNodeByKey(previewSchema.value as any[], key)
    if (!found) return true
    const info = getParentArrayAtPath(previewSchema.value as any[], found.path)
    if (!info) return true
    const { parentArr } = info
    const last = [...parentArr].reverse().find((n: any) => getContainerKind(n) === 'list' && (n as any)?.__preview_placeholder !== true)
    if (!last) return true
    return (last as any).__key === key
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
          if (getContainerKind(node) === 'list' && node.__key !== key && (node as any).__preview_placeholder !== true) return true
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

const cloneRuntime = (value: any): any => {
  if (Array.isArray(value)) return value.map((v) => cloneRuntime(v))
  if (value && typeof value === 'object') {
    const out: any = {}
    for (const k of Object.keys(value)) out[k] = cloneRuntime(value[k])
    return out
  }
  return value
}

const safeVar = (value: unknown) => {
  const raw = String(value ?? '')
  const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, '_')
  const start = cleaned.match(/^[a-zA-Z_]/) ? cleaned : `k_${cleaned}`
  return start || 'k_bind'
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

const applyBindRuntime = (schema: FormKitSchemaFormKit[], getModel: () => Record<string, unknown>) => {
  eachField(schema, (field: any) => {
    if (!field || typeof field !== 'object') return
    const bind = field.__bind
    if (!bind || typeof bind !== 'object' || Array.isArray(bind)) return

    const varName = `bind_${safeVar(field.__key || field.name || field.$formkit || field.$el)}`
    const attrs: any = { ...(bind as any) }

    for (const k of Object.keys(attrs)) {
      if (!k.startsWith('on')) continue
      const v = attrs[k]
      if (typeof v === 'string' && v.trim()) {
        const code = v
        attrs[k] = async (event: unknown) => {
          const data = getModel()
          await runBindCode(code, { event, data, attrs })
        }
      } else if (v && typeof v === 'object' && typeof v.__js === 'string') {
        const code = v.__js
        attrs[k] = async (event: unknown) => {
          const data = getModel()
          await runBindCode(code, { event, data, attrs })
        }
      }
    }

    getModel()[varName] = attrs
    field.bind = `$${varName}`
    delete field.__bind
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
  data.value = reactive(cloneRuntime(previewRuntimeData.value))
}

const open = () => {
  isOpen.value = true
  previewSchema.value = safeClone(formSchema.value)
  data.value = reactive({})
  applyBindRuntime(previewSchema.value, () => data.value as any)
  previewRuntimeData.value = cloneRuntime(data.value)
  previewListItemSeq.value = {}
  lastComputedValueByName.value = {}
  lastDepsSigByName.value = {}
}

const close = () => {
  isOpen.value = false
  data.value = {}
  previewSchema.value = []
  previewListItemSeq.value = {}
  lastComputedValueByName.value = {}
  lastDepsSigByName.value = {}
  previewRuntimeData.value = {}
}

defineExpose({
  open,
  close,
})
</script>
