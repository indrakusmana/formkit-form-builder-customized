<script setup lang="ts">
import type { FormKitSchemaFormKit } from '@formkit/core'
import { computed } from 'vue'
import { FormKit, FormKitSchema } from '@formkit/vue'
import { NEmpty } from 'naive-ui'
import { useFormBuilderI18n } from '@/i18n/context'

const props = defineProps<{
  nodeKey?: string
  children?: FormKitSchemaFormKit[]
  modelValue?: FormKitSchemaFormKit[]
  label?: string
  isPlaceholder?: boolean
}>()

const { t } = useFormBuilderI18n()

const title = computed(() => (typeof props.label === 'string' && props.label.trim() ? props.label.trim() : ''))
const showHeader = computed(() => !!title.value)
const name = computed(() => (props.nodeKey && props.nodeKey.trim() ? props.nodeKey.trim() : 'elements'))
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
    <div v-if="props.isPlaceholder === true" class="p-2 w-full">
      <n-empty :description="t('builder.listDropHere')" />
    </div>
    <div v-else-if="modelValue.length" class="p-2 w-full">
      <FormKit type="repeater" :name="name" :value="[{}]" :disabled="false">
        <FormKitSchema :schema="modelValue" />
      </FormKit>
    </div>
    <div v-else class="p-2 w-full">
      <n-empty :description="t('builder.listDropHere')" />
    </div>
  </div>
</template>
