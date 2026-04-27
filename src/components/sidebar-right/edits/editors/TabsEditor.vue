<script setup lang="ts">
import LabelHelpSection from '../common/LabelHelpSection.vue'
import SelectInput from '../common/SelectInput.vue'
import SwitchInput from '../common/SwitchInput.vue'
import { useFormField } from '../../../../composables/form-fields'

const { createPropsProp } = useFormField()

const type = createPropsProp<string>('type', 'line')
const size = createPropsProp<string>('size', 'medium')
const animated = createPropsProp<boolean>('animated', true)
const closable = createPropsProp<boolean>('closable', false)
</script>

<template>
  <LabelHelpSection />
  <SelectInput
    label="type"
    :value="type"
    :options="[
      { label: 'line', value: 'line' },
      { label: 'bar', value: 'bar' },
      { label: 'segment', value: 'segment' },
      { label: 'card', value: 'card' },
    ]"
    @update:value="(v) => (type = v)"
  />
  <SelectInput
    label="size"
    :value="size"
    :options="[
      { label: 'small', value: 'small' },
      { label: 'medium', value: 'medium' },
      { label: 'large', value: 'large' },
    ]"
    @update:value="(v) => (size = v)"
  />
  <SwitchInput label="animated" :value="animated" @update:value="(v) => (animated = v)" />
  <SwitchInput label="closable" :value="closable" @update:value="(v) => (closable = v)" />
</template>
