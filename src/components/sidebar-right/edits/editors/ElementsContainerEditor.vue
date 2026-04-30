<script setup lang="ts">
import { useFormField } from '../../../../composables/form-fields'
import LabelHelpSection from '../common/LabelHelpSection.vue'
import SwitchInput from '../common/SwitchInput.vue'

const { createPropsProp } = useFormField()

const dndEnabled = createPropsProp<boolean>('dndEnabled', true)
const useDragHandle = createPropsProp<boolean>('useDragHandle', false)
</script>

<template>
  <LabelHelpSection />
  <SwitchInput label="dndEnabled" :value="dndEnabled" @update:value="(v) => (dndEnabled = v)" />
  <SwitchInput label="useDragHandle" :value="useDragHandle" @update:value="(v) => (useDragHandle = v)" />
</template>
