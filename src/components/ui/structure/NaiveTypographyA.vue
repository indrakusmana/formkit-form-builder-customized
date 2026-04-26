<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import { NA } from 'naive-ui'
import { computed } from 'vue'
import { getSchemaProps } from './schema-props'

const props = defineProps<{
  context: FormKitFrameworkContext
}>()

const uiProps = computed<Record<string, unknown>>(() => getSchemaProps(props.context))

const text = computed(() => {
  const raw = uiProps.value.text
  if (typeof raw === 'string') return raw
  return String(props.context._value ?? '')
})

const href = computed(() => (uiProps.value.href as string | undefined) ?? '#')
const target = computed(() => uiProps.value.target as any)
</script>

<template>
  <NA :href="href" :target="target">
    {{ text }}
  </NA>
</template>
