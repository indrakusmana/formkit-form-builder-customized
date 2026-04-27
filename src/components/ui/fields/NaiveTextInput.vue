<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import type { InputProps } from 'naive-ui'
import { NInput } from 'naive-ui'
import { computed } from 'vue'
import { getSchemaProps } from './schema-props'
import { createSchemaRuntimeContext, runBindCode } from '@/utils/bind-runtime'

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
const inputProps = computed<Record<string, unknown>>(() => {
  const raw = uiProps.value.inputProps
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
})
const mergedInputProps = computed<Record<string, unknown>>(() => ({ ...(inputProps.value as any), id: props.context.id }))

const inputType = computed(() => {
  const type = props.context.type
  if (type === 'password') return 'password'
  return 'text'
})

const value = computed(() => (props.context._value ?? '') as string)
const placeholder = computed(() => props.context.placeholder as string | undefined)

const bind = computed(() => {
  const b: any = props.context?.node?.props?.__bind
  return b && typeof b === 'object' ? (b as Record<string, unknown>) : {}
})

const runEvent = async (key: string, event: unknown, extra?: Record<string, unknown>) => {
  const code = bind.value[key]
  if (typeof code !== 'string' || !code.trim()) return
  const $ = createSchemaRuntimeContext(props.context, event, extra)
  await runBindCode(code, { event, data: props.context?.node?.root?.value, attrs: props.context?.attrs, $ })
}

async function handleUpdateValue(next: string) {
  props.context.node.input(next)
  await runEvent('onInput', next, { $value: next })
  await runEvent('onChange', next, { $value: next })
}

const handleFocus = async (e: FocusEvent) => {
  await runEvent('onFocus', e)
}

const handleBlur = async (e: FocusEvent) => {
  await runEvent('onBlur', e)
  props.context.handlers.blur(e)
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
    :input-props="mergedInputProps"
    :bordered="bordered"
    @update:value="handleUpdateValue"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>
