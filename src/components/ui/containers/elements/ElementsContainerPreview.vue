<script setup lang="ts">
import type { FormKitSchemaFormKit } from '@formkit/core'
import { computed } from 'vue'
import { FormKitSchema } from '@formkit/vue'
import { NEmpty } from 'naive-ui'
import { useFormBuilderI18n } from '@/i18n/context'

const props = defineProps<{
  nodeKey?: string
  elementsKey?: string
  children?: FormKitSchemaFormKit[]
  modelValue?: FormKitSchemaFormKit[]
  label?: string
  isPlaceholder?: boolean
}>()

const { t } = useFormBuilderI18n()

const title = computed(() => (typeof props.label === 'string' && props.label.trim() ? props.label.trim() : ''))
const showHeader = computed(() => !!title.value)
const modelValue = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  if (Array.isArray(props.children)) return props.children
  return []
})
</script>

<template>
  <div class="w-full rounded-xl border border-border/50 bg-card/50">
    <div v-if="showHeader" class="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <div class="text-xs text-muted-foreground">{{ title }}</div>
    </div>
    <div class="p-2 w-full grid grid-cols-12 gap-x-4 gap-y-2">
      <FormKitSchema v-if="modelValue.length" :schema="modelValue" />
      <n-empty v-else :description="t('builder.listDropHere')" />
    </div>
  </div>
</template>
