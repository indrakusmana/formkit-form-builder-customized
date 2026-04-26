<script setup lang="ts">
import { computed } from 'vue'
import { useFormField } from '../../../../composables/form-fields'
import { DEFAULT_DATE_VALUE_FORMAT, DEFAULT_TIME_VALUE_FORMAT } from '../../../../utils/default-form-elements'
import LabelHelpSection from '../common/LabelHelpSection.vue'
import PlaceholderSection from '../common/PlaceholderSection.vue'
import NaiveBasicSection from '../common/NaiveBasicSection.vue'
import TextInput from '../common/TextInput.vue'

const { createPropsProp, currentFieldType } = useFormField()

const defaultValueFormat = computed(() => {
  if (currentFieldType.value === 'time') return DEFAULT_TIME_VALUE_FORMAT
  return DEFAULT_DATE_VALUE_FORMAT
})

const naiveValueFormat = createPropsProp<string>('valueFormat', '')
const valueFormat = computed<string>({
  get: () => {
    const raw = naiveValueFormat.value
    if (typeof raw === 'string' && raw.trim()) return raw
    return defaultValueFormat.value
  },
  set: (v) => {
    naiveValueFormat.value = v
  },
})
</script>

<template>
  <LabelHelpSection />
  <PlaceholderSection />
  <TextInput
    label="value-format"
    :placeholder="defaultValueFormat"
    :value="valueFormat"
    @update:value="(v) => (valueFormat = v)"
  />
  <NaiveBasicSection :size="true" :disabled="true" :clearable="true" />
</template>
