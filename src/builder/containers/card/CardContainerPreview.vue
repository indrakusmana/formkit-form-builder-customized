<script setup lang="ts">
import type { FormKitSchemaFormKit } from '@formkit/core'
import { computed } from 'vue'
import { FormKitSchema } from '@formkit/vue'
import { NEmpty } from 'naive-ui'
import { useFormBuilderI18n } from '../../../i18n/context'

const props = defineProps<{
  children: FormKitSchemaFormKit[]
  label?: string
}>()

const { t } = useFormBuilderI18n()

const title = computed(() => (typeof props.label === 'string' && props.label.trim() ? props.label.trim() : ''))
const showHeader = computed(() => !!title.value)
const modelValue = computed(() => (Array.isArray(props.children) ? props.children : []))
</script>

<template>
  <div class="w-full rounded-xl border border-border/50 bg-card/50">
    <div v-if="showHeader" class="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <div class="text-xs text-muted-foreground">{{ title }}</div>
    </div>

    <div class="p-2">
      <div class="w-full grid grid-cols-12 gap-x-4 gap-y-2">
        <FormKitSchema v-if="modelValue.length" :schema="modelValue" />
        <n-empty v-else :description="t('builder.listDropHere')" />
      </div>
    </div>
  </div>
</template>

