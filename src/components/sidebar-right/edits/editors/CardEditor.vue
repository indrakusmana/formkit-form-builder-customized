<script setup lang="ts">
import { useFormField } from '../../../../composables/form-fields'
import LabelHelpSection from '../common/LabelHelpSection.vue'
import SelectInput from '../common/SelectInput.vue'
import SwitchInput from '../common/SwitchInput.vue'

const { createNaiveProp } = useFormField()

const cardSize = createNaiveProp<string>('size', 'medium')
const cardBordered = createNaiveProp<boolean>('bordered', true)
const cardEmbedded = createNaiveProp<boolean>('embedded', false)
const cardHoverable = createNaiveProp<boolean>('hoverable', false)
</script>

<template>
  <LabelHelpSection />
  <SelectInput
    label="size"
    :value="cardSize"
    :options="[
      { label: 'small', value: 'small' },
      { label: 'medium', value: 'medium' },
      { label: 'large', value: 'large' },
      { label: 'huge', value: 'huge' },
    ]"
    @update:value="(v) => (cardSize = v)"
  />
  <SwitchInput label="bordered" :value="cardBordered" @update:value="(v) => (cardBordered = v)" />
  <SwitchInput label="embedded" :value="cardEmbedded" @update:value="(v) => (cardEmbedded = v)" />
  <SwitchInput label="hoverable" :value="cardHoverable" @update:value="(v) => (cardHoverable = v)" />
</template>

