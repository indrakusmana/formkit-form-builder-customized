<script setup lang="ts">
import { computed } from 'vue'
import { fieldProps } from '../../../../utils/field-props'
import { useFormField, selectedField } from '../../../../composables/form-fields'
import { formSchema, selectedKey } from '../../../../utils/default-form-elements'
import { useFormBuilderI18n } from '../../../../i18n/context'
import TextInput from './TextInput.vue'

const { currentFieldType, fieldName, hasField } = useFormField()
const { t } = useFormBuilderI18n()

const isFieldsCategory = computed(() => {
  if (!currentFieldType.value) return false
  const prop = fieldProps.find((p) => p.name === currentFieldType.value)
  return (prop?.category || 'fields') === 'fields'
})

const currentFieldKey = computed(() => selectedKey.value ?? undefined)

const isNameTaken = (name: string) => {
  const walk = (schema: any[]): boolean => {
    for (const field of schema) {
      if (field?.name === name) {
        const key = field?.__key as string | undefined
        if (currentFieldKey.value && key && key !== currentFieldKey.value) return true
        if (!currentFieldKey.value && field !== selectedField.value) return true
      }
      if (Array.isArray(field?.children) && walk(field.children)) return true
    }
    return false
  }
  if (!name) return false
  return walk(formSchema.value as any[])
}

const nameError = computed(() => {
  if (!isFieldsCategory.value) return ''
  if (!fieldName.value) return 'Name is required'
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldName.value)) return 'Name can only contain letters, numbers, and _, and cannot start with a number'
  if (isNameTaken(fieldName.value)) return 'Name already exists'
  return ''
})
</script>

<template>
  <TextInput
    v-if="hasField && isFieldsCategory"
    label="Name"
    :placeholder="t('edits.placeholder.fieldName')"
    :value="fieldName"
    :error="nameError"
    @update:value="(v) => (fieldName = v)"
  />
</template>
