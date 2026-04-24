<script setup lang="ts">
import { computed } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { NCard } from 'naive-ui'
import { useFormBuilderI18n } from '../../../i18n/context'
import { selectedKey } from '../../../utils/default-form-elements'
import { useContainerDragAndDrop } from '@/builder/composables/use-container-drag-and-drop'
import ContainerChildrenGrid from '../shared/ContainerChildrenGrid.vue'

const props = defineProps<{
  cardKey?: string
  modelValue: FormKitSchemaFormKit[]
  label?: string
  disabled?: boolean
  help?: string
  naiveProps?: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormKitSchemaFormKit[]): void
  (e: 'select', key: string): void
}>()

const { t } = useFormBuilderI18n()

const initial = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

const dnd = useContainerDragAndDrop<FormKitSchemaFormKit>({
  modelValue: initial,
  onUpdateModelValue: (value) => emit('update:modelValue', value),
})

const title = computed(() => (typeof props.label === 'string' && props.label.trim() ? props.label.trim() : ''))
const helpText = computed(() => (typeof props.help === 'string' && props.help.trim() ? props.help.trim() : ''))
const cardProps = computed<Record<string, unknown>>(() => (props.naiveProps ?? {}) as Record<string, unknown>)

const bordered = computed<boolean>(() => (cardProps.value.bordered as boolean | undefined) ?? true)
const embedded = computed<boolean>(() => (cardProps.value.embedded as boolean | undefined) ?? false)
const hoverable = computed<boolean>(() => (cardProps.value.hoverable as boolean | undefined) ?? false)
const size = computed(() => (cardProps.value.size as string | undefined) ?? 'medium')
const showHeader = computed(() => Boolean(title.value || helpText.value))

const onSelect = (child: any) => {
  const key = child?.__key as string | undefined
  if (key) emit('select', key)
}

const deleteChild = (index: number) => {
  const next = dnd.items.value.filter((_, i) => i !== index)
  dnd.items.value = next
  dnd.emitUpdate()
}
</script>

<template>
  <n-card
    class="w-full"
    :bordered="bordered"
    :embedded="embedded"
    :hoverable="hoverable"
    :size="size as any"
    content-style="padding: 8px;"
  >
    <template v-if="showHeader" #header>
      <div class="flex flex-col gap-0.5">
        <div v-if="title" class="text-sm font-medium">{{ title }}</div>
        <div v-if="helpText" class="text-xs text-muted-foreground">{{ helpText }}</div>
      </div>
    </template>
    <ContainerChildrenGrid
      :container-ref="dnd.containerRef"
      :items="dnd.items"
      :selected-key="selectedKey"
      :empty-text="t('builder.listDropHere')"
      :delete-aria-label="t('builder.deleteField')"
      :show-delete-tooltip="true"
      :delete-tooltip-text="t('builder.deleteField')"
      :data-attrs="{ 'data-card-key': props.cardKey }"
      :set-nested-parent-on-root="dnd.setNestedParentOnRoot"
      :on-select="onSelect"
      :on-delete="deleteChild"
      :on-resize-end="dnd.emitUpdate"
    />
  </n-card>
</template>
