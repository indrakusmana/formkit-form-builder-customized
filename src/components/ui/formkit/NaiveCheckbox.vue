<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import { NCheckbox } from 'naive-ui'
import { computed } from 'vue'
import { getSchemaProps } from './schema-props'

const props = defineProps<{
  context: FormKitFrameworkContext
}>()

const uiProps = computed<Record<string, unknown>>(() => getSchemaProps(props.context))

type CheckboxSize = 'small' | 'medium' | 'large'

const size = computed<CheckboxSize>(() => {
  const raw = uiProps.value.size as string | undefined
  if (raw === 'tiny') return 'small'
  if (raw === 'small' || raw === 'medium' || raw === 'large') return raw
  return 'medium'
})

const disabled = computed<boolean>(() =>
  Boolean((uiProps.value.disabled as boolean | undefined) ?? props.context.disabled ?? false),
)

const checked = computed<boolean>(() => Boolean(props.context._value ?? false))

function handleUpdateChecked(next: boolean) {
  props.context.node.input(next)
}
</script>

<template>
  <div class="w-full py-1">
    <NCheckbox :checked="checked" :disabled="disabled" :size="size" @update:checked="handleUpdateChecked" />
  </div>
</template>
