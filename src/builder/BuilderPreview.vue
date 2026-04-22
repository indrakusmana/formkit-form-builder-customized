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
import { ListContainerPreview } from './containers'
import { collectSchemaNames, ensureUniqueName, generateKey, toSafeName } from '../utils/dnd/schema'

const { t } = useFormBuilderI18n()

const isOpen = ref(false)
const data = ref({})
const previewSchema = ref<FormKitSchemaFormKit[]>([])
const formattedSchema = createFormattedSchema(previewSchema)
const schemaLibrary = computed(() => ({ ListContainerPreview }))

provide('isPreviewOpen', isOpen)
provide(
  'previewListUpdateChildren',
  (key: string, children: FormKitSchemaFormKit[]) => {
    const idx = previewSchema.value.findIndex((n: any) => n?.__key === key)
    if (idx < 0) return
    const next = [...previewSchema.value]
    next[idx] = { ...(next[idx] as any), children: [...children] } as any
    previewSchema.value = next
  },
)

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
    const idx = previewSchema.value.findIndex((n: any) => n?.__key === key)
    if (idx < 0) return
    const existingNames = new Set<string>()
    collectSchemaNames(previewSchema.value as any, existingNames)
    const cloned = cloneNodeWithFreshIdentity(structuredClone(previewSchema.value[idx] as any), existingNames)
    const next = [...previewSchema.value]
    next.splice(idx + 1, 0, cloned)
    previewSchema.value = next
  },
)

provide(
  'previewListRemove',
  (key: string) => {
    const idx = previewSchema.value.findIndex((n: any) => n?.__key === key)
    if (idx < 0) return
    const next = [...previewSchema.value]
    next.splice(idx, 1)
    previewSchema.value = next
  },
)

const lastComputedValueByName = ref<Record<string, string>>({})
const lastDepsSigByName = ref<Record<string, string>>({})

const eachField = (schema: FormKitSchemaFormKit[], fn: (field: any) => void) => {
  for (const field of schema) {
    fn(field)
    const children = (field as any)?.children
    if (Array.isArray(children)) eachField(children as FormKitSchemaFormKit[], fn)
  }
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
  previewSchema.value = structuredClone(formSchema.value)
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
