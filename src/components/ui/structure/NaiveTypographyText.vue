<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import { NText } from 'naive-ui'
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
const tag = computed(() => uiProps.value.tag as any)
const strong = computed(() => Boolean((uiProps.value.strong as boolean | undefined) ?? false))
const italic = computed(() => Boolean((uiProps.value.italic as boolean | undefined) ?? false))
const underline = computed(() => Boolean((uiProps.value.underline as boolean | undefined) ?? false))
const del = computed(() => Boolean((uiProps.value.delete as boolean | undefined) ?? false))
const code = computed(() => Boolean((uiProps.value.code as boolean | undefined) ?? false))
</script>

<template>
  <NText
    :type="type"
    :depth="depth as any"
    :tag="tag"
    :strong="strong"
    :italic="italic"
    :underline="underline"
    :delete="del"
    :code="code"
  >
    {{ text }}
  </NText>
</template>
