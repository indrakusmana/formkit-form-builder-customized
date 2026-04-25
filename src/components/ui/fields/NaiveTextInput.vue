<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import type { InputProps } from 'naive-ui'
import { NInput } from 'naive-ui'
import { computed } from 'vue'
import { getSchemaProps } from './schema-props'

const props = defineProps<{
  context: FormKitFrameworkContext
}>()

const uiProps = computed<Record<string, unknown>>(() => getSchemaProps(props.context))

const size = computed<InputProps['size']>(() => (uiProps.value.size as InputProps['size']) ?? 'medium')
const clearable = computed<boolean>(() => (uiProps.value.clearable as boolean | undefined) ?? true)
const disabled = computed<boolean>(() =>
  Boolean((uiProps.value.disabled as boolean | undefined) ?? props.context.disabled ?? false),
)
const bordered = computed<boolean>(() => (uiProps.value.bordered as boolean | undefined) ?? true)

const inputType = computed(() => {
  const type = props.context.type
  if (type === 'password') return 'password'
  return 'text'
})

const value = computed(() => (props.context._value ?? '') as string)
const placeholder = computed(() => props.context.placeholder as string | undefined)

function handleUpdateValue(next: string) {
  props.context.node.input(next)
}
</script>

<template>
  <NInput
    :value="value"
    :type="inputType"
    :size="size"
    :clearable="clearable"
    :disabled="disabled"
    :placeholder="placeholder"
    :input-props="{ id: context.id }"
    :bordered="bordered"
    @update:value="handleUpdateValue"
    @blur="context.handlers.blur"
  />
</template>
