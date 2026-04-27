<script setup lang="ts">
import { computed } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { NInputGroup } from 'naive-ui'
import { useFormBuilderI18n } from '@/i18n/context'
import { selectedKey } from '@/utils/default-form-elements'
import { useContainerDragAndDrop } from '@/builder/composables/use-container-drag-and-drop'
import { useCanvasSchemaContext } from '@/builder/composables/canvas-schema-context'
import ContainerChildrenGrid from '@/components/ui/containers/shared/ContainerChildrenGrid.vue'

const props = defineProps<{
  inputGroupKey?: string
  modelValue: FormKitSchemaFormKit[]
  label?: string
  disabled?: boolean
  help?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormKitSchemaFormKit[]): void
  (e: 'select', key: string): void
}>()

const { t } = useFormBuilderI18n()

const initial = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

const canvasCtx = useCanvasSchemaContext()

const dnd = useContainerDragAndDrop<FormKitSchemaFormKit>({
  modelValue: initial,
  onUpdateModelValue: (value) => {
    const k = props.inputGroupKey
    if (k && canvasCtx?.updateContainerChildren) canvasCtx.updateContainerChildren(k, value)
    else emit('update:modelValue', value)
  },
})

const title = computed(() => (typeof props.label === 'string' && props.label.trim() ? props.label.trim() : ''))
const helpText = computed(() => (typeof props.help === 'string' && props.help.trim() ? props.help.trim() : ''))
const showHeader = computed(() => Boolean(title.value || helpText.value))

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
    <div v-if="showHeader" class="flex flex-col gap-0.5 px-3 py-2 border-b border-border/50">
      <div v-if="title" class="text-xs text-muted-foreground">{{ title }}</div>
      <div v-if="helpText" class="text-[11px] text-muted-foreground">{{ helpText }}</div>
    </div>

    <div class="p-2">
      <n-input-group class="w-full">
        <ContainerChildrenGrid
          :container-ref="dnd.containerRef"
          :items="dnd.items"
          :selected-key="selectedKey"
          :empty-text="t('builder.listDropHere')"
          :delete-aria-label="t('builder.deleteField')"
          :data-attrs="{ 'data-input-group-key': props.inputGroupKey }"
          :allowed-insert-directions="{ left: true, right: true, top: false, bottom: false }"
          :set-nested-parent-on-root="dnd.setNestedParentOnRoot"
          :on-select="onSelect"
          :on-delete="deleteChild"
          :on-resize-end="dnd.emitUpdate"
          ul-class="p-0"
        />
      </n-input-group>
    </div>
  </div>
</template>
