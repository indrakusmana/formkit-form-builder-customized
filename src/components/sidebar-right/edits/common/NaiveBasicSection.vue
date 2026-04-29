<script setup lang="ts">
import { useFormField } from '../../../../composables/form-fields'
import NumberInput from './NumberInput.vue'
import SelectInput from './SelectInput.vue'
import SwitchInput from './SwitchInput.vue'

const props = defineProps<{
  size?: boolean
  disabled?: boolean
  clearable?: boolean
  bordered?: boolean
  readonly?: boolean
  round?: boolean
  autofocus?: boolean
  showCount?: boolean
  maxlength?: boolean
  minlength?: boolean
}>()

const { createPropsProp } = useFormField()

const naiveSize = createPropsProp<string>('size', 'medium')
const naiveDisabled = createPropsProp<boolean>('disabled', false)
const naiveClearable = createPropsProp<boolean>('clearable', true)
const naiveBordered = createPropsProp<boolean>('bordered', true)
const naiveReadonly = createPropsProp<boolean>('readonly', false)
const naiveRound = createPropsProp<boolean>('round', false)
const naiveAutofocus = createPropsProp<boolean>('autofocus', false)
const naiveShowCount = createPropsProp<boolean>('showCount', false)
const naiveMaxlength = createPropsProp<number | null>('maxlength', null)
const naiveMinlength = createPropsProp<number | null>('minlength', null)
</script>

<template>
  <SelectInput
    v-if="props.size"
    label="size"
    :value="naiveSize"
    :options="[
      { label: 'tiny', value: 'tiny' },
      { label: 'small', value: 'small' },
      { label: 'medium', value: 'medium' },
      { label: 'large', value: 'large' },
    ]"
    @update:value="(v) => (naiveSize = v)"
  />
  <SwitchInput
    v-if="props.disabled"
    label="disabled"
    :value="naiveDisabled"
    @update:value="(v) => (naiveDisabled = v)"
  />
  <SwitchInput
    v-if="props.clearable"
    label="clearable"
    :value="naiveClearable"
    @update:value="(v) => (naiveClearable = v)"
  />
  <SwitchInput
    v-if="props.bordered"
    label="bordered"
    :value="naiveBordered"
    @update:value="(v) => (naiveBordered = v)"
  />
  <SwitchInput
    v-if="props.readonly"
    label="readonly"
    :value="naiveReadonly"
    @update:value="(v) => (naiveReadonly = v)"
  />
  <SwitchInput
    v-if="props.round"
    label="round"
    :value="naiveRound"
    @update:value="(v) => (naiveRound = v)"
  />
  <SwitchInput
    v-if="props.autofocus"
    label="autofocus"
    :value="naiveAutofocus"
    @update:value="(v) => (naiveAutofocus = v)"
  />
  <SwitchInput
    v-if="props.showCount"
    label="showCount"
    :value="naiveShowCount"
    @update:value="(v) => (naiveShowCount = v)"
  />
  <NumberInput
    v-if="props.maxlength"
    label="maxlength"
    placeholder="null"
    :value="naiveMaxlength"
    @update:value="(v) => (naiveMaxlength = v)"
  />
  <NumberInput
    v-if="props.minlength"
    label="minlength"
    placeholder="null"
    :value="naiveMinlength"
    @update:value="(v) => (naiveMinlength = v)"
  />
</template>
