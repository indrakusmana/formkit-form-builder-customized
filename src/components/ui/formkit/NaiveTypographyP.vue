<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import { NP } from 'naive-ui'
import { computed } from 'vue'
import { getSchemaProps } from './schema-props'

const props = defineProps<{
  context: FormKitFrameworkContext
}>()

const uiProps = computed<Record<string, unknown>>(() => getSchemaProps(props.context))

const text = computed(() => String(props.context._value ?? ''))

const type = computed(() => uiProps.value.type as any)
const depth = computed(() => {
  const raw = uiProps.value.depth as unknown
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string') {
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
})
const align = computed(() => uiProps.value.align as any)
</script>

<template>
  <NP :type="type" :depth="depth as any" :align="align">
    {{ text }}
  </NP>
</template>
