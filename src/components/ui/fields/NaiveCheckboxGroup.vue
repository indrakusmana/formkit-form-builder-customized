<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import { NCheckbox, NCheckboxGroup } from 'naive-ui'
import { computed } from 'vue'
import { getSchemaProps } from './schema-props'

const props = defineProps<{
  context: FormKitFrameworkContext
}>()

const uiProps = computed<Record<string, unknown>>(() => getSchemaProps(props.context))

type GroupSize = 'small' | 'medium' | 'large'

const size = computed<GroupSize>(() => {
  const raw = uiProps.value.size as string | undefined
  if (raw === 'tiny') return 'small'
  if (raw === 'small' || raw === 'medium' || raw === 'large') return raw
  return 'medium'
})
const disabled = computed<boolean>(() =>
  Boolean((uiProps.value.disabled as boolean | undefined) ?? props.context.disabled ?? false),
)

const options = computed(() => {
  const raw = props.context.options as unknown
  if (!Array.isArray(raw)) return []
  return raw
    .map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { label: String(opt), value: opt }
      }
      if (opt && typeof opt === 'object') {
        const value = (opt as Record<string, unknown>).value
        const label = (opt as Record<string, unknown>).label
        if (value !== undefined) return { label: String(label ?? value), value }
      }
      return null
    })
    .filter((v): v is { label: string; value: string | number } => v !== null)
})

const value = computed(() => {
  const raw = props.context._value as unknown
  if (Array.isArray(raw)) return raw
  if (raw === null || raw === undefined || raw === '') return []
  return [raw]
})

function handleUpdateValue(next: Array<string | number>) {
  props.context.node.input(next)
}
</script>

<template>
  <NCheckboxGroup :value="value" :disabled="disabled" :size="size" @update:value="handleUpdateValue">
    <div class="flex flex-col gap-2 w-full py-1">
      <NCheckbox v-for="opt in options" :key="String(opt.value)" :value="opt.value" :label="opt.label" />
    </div>
  </NCheckboxGroup>
</template>
