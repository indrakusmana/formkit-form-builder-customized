<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import { NMention } from 'naive-ui'
import { computed } from 'vue'
import { getSchemaProps } from './schema-props'

const props = defineProps<{
  context: FormKitFrameworkContext
}>()

const uiProps = computed<Record<string, unknown>>(() => getSchemaProps(props.context))

type MentionSize = 'small' | 'medium' | 'large'

const size = computed<MentionSize>(() => {
  const raw = uiProps.value.size as string | undefined
  if (raw === 'tiny') return 'small'
  if (raw === 'small' || raw === 'medium' || raw === 'large') return raw
  return 'medium'
})
const disabled = computed<boolean>(() =>
  Boolean((uiProps.value.disabled as boolean | undefined) ?? props.context.disabled ?? false),
)
const placeholder = computed(() => props.context.placeholder as string | undefined)

const options = computed(() => {
  const raw = props.context.options as unknown
  if (!Array.isArray(raw)) return []
  return raw
    .map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        const s = String(opt)
        return { label: s, value: s }
      }
      if (opt && typeof opt === 'object') {
        const value = (opt as Record<string, unknown>).value
        const label = (opt as Record<string, unknown>).label
        if (typeof value === 'string' || typeof value === 'number') {
          return { label: String(label ?? value), value: String(value) }
        }
      }
      return null
    })
    .filter((v): v is { label: string; value: string } => v !== null)
})

const value = computed(() => (props.context._value ?? '') as string)

function handleUpdateValue(next: string) {
  props.context.node.input(next)
}
</script>

<template>
  <NMention
    :value="value"
    :options="options"
    :placeholder="placeholder"
    :disabled="disabled"
    :size="size"
    @update:value="handleUpdateValue"
    @blur="context.handlers.blur"
  />
</template>
