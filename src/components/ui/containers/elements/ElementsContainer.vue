<script setup lang="ts">
import { computed } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { useFormBuilderI18n } from '@/i18n/context'
import { selectedKey } from '@/utils/default-form-elements'
import { useContainerDragAndDrop } from '@/builder/composables/use-container-drag-and-drop'
import ContainerChildrenGrid from '../shared/ContainerChildrenGrid.vue'
import { useCanvasSchemaContext } from '@/builder/composables/canvas-schema-context'

const props = defineProps<{
  elementsKey?: string
  modelValue: FormKitSchemaFormKit[]
  label?: string
  disabled?: boolean
  dndEnabled?: boolean
  useDragHandle?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormKitSchemaFormKit[]): void
  (e: 'select', key: string): void
}>()

const { t } = useFormBuilderI18n()

const initial = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))
const dndEnabled = computed(() => props.dndEnabled !== false)
const dragHandleSelector = computed(() => (props.useDragHandle === true ? '[data-dnd-handle="true"]' : undefined))

const canvasCtx = useCanvasSchemaContext()

const dnd = useContainerDragAndDrop<FormKitSchemaFormKit>({
  modelValue: initial,
  enabled: dndEnabled,
  dragHandle: dragHandleSelector,
  onUpdateModelValue: (value) => {
    const k = props.elementsKey
    if (k && canvasCtx?.updateContainerChildren) canvasCtx.updateContainerChildren(k, value)
    else emit('update:modelValue', value)
  },
})

const title = computed(() => (typeof props.label === 'string' && props.label.trim() ? props.label.trim() : ''))

const onSelect = (child: any, _index: number) => {
  const key = child?.__key as string | undefined
  if (!key) return
  if (canvasCtx?.selectByKey) canvasCtx.selectByKey(key)
  else emit('select', key)
}

const deleteChild = (index: number) => {
  const next = dnd.items.value.filter((_, i) => i !== index)
  dnd.items.value = next
  dnd.emitUpdate()
}
</script>

<template>
  <div class="w-full rounded-xl border border-border/50 bg-card/50">
    <div v-if="title" class="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <div class="text-xs text-muted-foreground">{{ title }}</div>
    </div>
    <div class="p-2">
      <ContainerChildrenGrid
        :container-ref="dnd.containerRef"
        :items="dnd.items"
        :selected-key="selectedKey"
        :empty-text="t('builder.listDropHere')"
        :delete-aria-label="t('builder.deleteField')"
        :resize-aria-label="t('builder.resizeFieldWidth')"
        :data-attrs="{ 'data-elements-key': props.elementsKey }"
        :set-nested-parent-on-root="dnd.setNestedParentOnRoot"
        :on-select="onSelect"
        :on-delete="deleteChild"
        :on-resize-end="dnd.emitUpdate"
        :drag-enabled="dndEnabled"
        :drag-handle="props.useDragHandle === true"
      />
    </div>
  </div>
</template>
