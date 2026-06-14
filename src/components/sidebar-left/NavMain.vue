<script setup lang="ts">
import { inject, computed, ref, type Ref } from 'vue'
import { NTabs, NTabPane, NScrollbar } from 'naive-ui'
import { createFieldProps } from '../../utils/field-props'
import { createDefaultFormElements } from '../../utils/default-form-elements'
import DraggableList from './DraggableList.vue'
import { useFormBuilderI18n } from '../../i18n/context'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { getContainerKind } from '../../utils/schema/containers'
import { useFormBuilderConfig } from '../../composables/use-config'
import { DEFAULT_ENABLED_FIELDS, type FormBuilderFieldName } from '../../types/env'

const searchInput = inject('searchInput', ref(''))
const collapsed = inject('sidebarCollapsed', ref(false)) as Ref<boolean>
const { t } = useFormBuilderI18n()
const config = useFormBuilderConfig()
const fieldProps = computed(() => createFieldProps(t))

const getTypeName = (item: any) => {
  const kind = getContainerKind(item)
  if (kind) return kind
  return String(item?.$formkit ?? item?.$cmp ?? '')
}

const enabledFieldNames = computed(() => {
  const configured = config.enabledFields ?? DEFAULT_ENABLED_FIELDS
  return new Set<FormBuilderFieldName>(configured)
})

const defaultFormElements = computed(() =>
  createDefaultFormElements(t).filter((element) =>
    enabledFieldNames.value.has(getTypeName(element) as FormBuilderFieldName),
  ),
)

const filteredFormElements = computed(() => {
  if (!searchInput.value.trim()) {
    return defaultFormElements.value
  }

  const query = searchInput.value.toLowerCase()
  return defaultFormElements.value.filter(
    (element) =>
      element.name.toLowerCase().includes(query) ||
      element.description.toLowerCase().includes(query) ||
      String((element as any).$formkit ?? (element as any).$cmp ?? '').toLowerCase().includes(query),
  )
})

type ElementCategory = 'fields' | 'structure' | 'static'

const categories = computed<{ id: ElementCategory; label: string }[]>(() => [
  { id: 'fields', label: t('fieldProps.category.fields') },
  { id: 'structure', label: t('fieldProps.category.structure') },
  { id: 'static', label: t('fieldProps.category.static') },
])

const groupedElements = computed(() => {
  const groups: Record<ElementCategory, FormKitSchemaFormKit[]> = {
    fields: [],
    structure: [],
    static: [],
  }

  filteredFormElements.value.forEach((item) => {
    const typeName = getTypeName(item)
    const prop = fieldProps.value.find((p) => p.name === typeName)
    const category = (prop?.category || 'fields') as ElementCategory
    if (groups[category]) {
      groups[category].push(item)
    }
  })

  return groups
})

const visibleCategories = computed(() =>
  categories.value.filter((category) => groupedElements.value[category.id].length > 0),
)
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <n-scrollbar v-if="collapsed" class="h-full sidebar-scrollbar" content-class="py-2 px-1">
      <DraggableList :elements="filteredFormElements" />
    </n-scrollbar>
    <n-tabs
      v-else
      type="line"
      size="small"
      justify-content="space-evenly"
      class="h-full flex flex-col"
      pane-class="flex-1 overflow-hidden"
    >
      <n-tab-pane v-for="category in visibleCategories" :key="category.id" :name="category.id" :tab="category.label">
        <n-scrollbar class="h-full sidebar-scrollbar" content-class="pb-4 px-2">
          <DraggableList :elements="groupedElements[category.id]" />
        </n-scrollbar>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>
