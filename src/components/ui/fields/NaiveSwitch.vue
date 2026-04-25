<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import { NSwitch } from 'naive-ui'
import { computed } from 'vue'
import { getSchemaProps } from './schema-props'

const props = defineProps<{
  context: FormKitFrameworkContext
}>()

const uiProps = computed<Record<string, unknown>>(() => getSchemaProps(props.context))

type SwitchSize = 'small' | 'medium' | 'large'

const size = computed<SwitchSize>(() => {
  const raw = uiProps.value.size as string | undefined
  if (raw === 'tiny') return 'small'
  if (raw === 'small' || raw === 'medium' || raw === 'large') return raw
  return 'medium'
})

const disabled = computed<boolean>(() =>
  Boolean((uiProps.value.disabled as boolean | undefined) ?? props.context.disabled ?? false),
)

const value = computed<boolean>(() => Boolean(props.context._value ?? false))

function handleUpdateValue(next: boolean) {
  props.context.node.input(next)
}
</script>

<template>
  <NSwitch :value="value" :size="size" :disabled="disabled" @update:value="handleUpdateValue" />
</template>
