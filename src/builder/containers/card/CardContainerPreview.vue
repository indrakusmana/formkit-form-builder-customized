<script setup lang="ts">
import type { FormKitSchemaFormKit } from '@formkit/core'
import { computed } from 'vue'
import { FormKitSchema } from '@formkit/vue'
import { NCard, NEmpty } from 'naive-ui'
import { useFormBuilderI18n } from '../../../i18n/context'

const props = defineProps<{
  children: FormKitSchemaFormKit[]
  label?: string
  naiveProps?: Record<string, unknown>
}>()

const { t } = useFormBuilderI18n()

const title = computed(() => (typeof props.label === 'string' && props.label.trim() ? props.label.trim() : ''))
const modelValue = computed(() => (Array.isArray(props.children) ? props.children : []))

const cardProps = computed<Record<string, unknown>>(() => (props.naiveProps ?? {}) as Record<string, unknown>)

const bordered = computed<boolean>(() => (cardProps.value.bordered as boolean | undefined) ?? true)
const embedded = computed<boolean>(() => (cardProps.value.embedded as boolean | undefined) ?? false)
const hoverable = computed<boolean>(() => (cardProps.value.hoverable as boolean | undefined) ?? false)
const size = computed(() => (cardProps.value.size as string | undefined) ?? 'medium')
</script>

<template>
  <n-card
    class="w-full"
    :title="title || undefined"
    :bordered="bordered"
    :embedded="embedded"
    :hoverable="hoverable"
    :size="size as any"
    content-style="padding: 8px;"
  >
    <div class="w-full grid grid-cols-12 gap-x-4 gap-y-2">
      <FormKitSchema v-if="modelValue.length" :schema="modelValue" />
      <n-empty v-else :description="t('builder.listDropHere')" />
    </div>
  </n-card>
</template>
