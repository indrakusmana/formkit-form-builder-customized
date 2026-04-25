<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import { NSlider } from 'naive-ui'
import { computed } from 'vue'
import { getSchemaProps } from './schema-props'

const props = defineProps<{
  context: FormKitFrameworkContext
}>()

const uiProps = computed<Record<string, unknown>>(() => getSchemaProps(props.context))

const disabled = computed<boolean>(() =>
  Boolean((uiProps.value.disabled as boolean | undefined) ?? props.context.disabled ?? false),
)

const min = computed(() => (props.context.min as number | undefined) ?? 0)
const max = computed(() => (props.context.max as number | undefined) ?? 100)
const step = computed(() => {
  const raw = props.context.step as string | number | undefined
  if (raw === undefined) return 1
  if (typeof raw === 'number') return raw
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 1
})

const value = computed(() => {
  const raw = props.context._value as unknown
  if (raw === null || raw === undefined || raw === '') return min.value
  const parsed = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(parsed) ? parsed : min.value
})

function handleUpdateValue(next: number) {
  props.context.node.input(next)
}
</script>

<template>
  <NSlider
    :value="value"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    @update:value="handleUpdateValue"
  />
</template>
