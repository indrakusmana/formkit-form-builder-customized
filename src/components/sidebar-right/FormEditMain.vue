<script setup lang="ts">
import { computed } from 'vue'
import { NDivider } from 'naive-ui'
import { useFormBuilderI18n } from '../../i18n/context'
import ValidationSection from './validations/ValidationSection.vue'
import { useFormField } from '../../composables/form-fields'
import EditsSection from './edits/EditsSection.vue'
import ExpressionEditor from './edits/ExpressionEditor.vue'
import IfConditionEditor from './edits/IfConditionEditor.vue'
import BindEditor from './edits/BindEditor.vue'
import { createFieldProps } from '../../utils/field-props'

const { hasField, currentFieldType } = useFormField()
const { t } = useFormBuilderI18n()
const fieldProps = computed(() => createFieldProps(t))

const isFieldsCategory = computed(() => {
  if (!currentFieldType.value) return false
  const prop = fieldProps.value.find((p) => p.name === currentFieldType.value)
  return (prop?.category || 'fields') === 'fields'
})
</script>

<template>
  <div v-if="!hasField" class="flex p-2 h-full text-[11px] md:text-xs text-muted-foreground">
    {{ t('common.selectFieldToEdit') }}
  </div>
  <template v-else>
    <div class="p-2">
      <div class="space-y-2 md:space-y-3">
        <ExpressionEditor v-if="isFieldsCategory" />
        <IfConditionEditor />
        <BindEditor />
        <EditsSection />
        <n-divider />
        <ValidationSection />
      </div>
    </div>
  </template>
</template>
