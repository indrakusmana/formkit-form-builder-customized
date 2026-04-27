<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { FormKitSchema } from '@formkit/vue'
import { NButton, NEmpty } from 'naive-ui'
import { useFormBuilderI18n } from '@/i18n/context'
import { useContainerDragAndDrop } from '@/builder/composables/use-container-drag-and-drop'
import { useCanvasSchemaContext } from '@/builder/composables/canvas-schema-context'
import { toCanvasSchemaNode } from '@/utils/canvas-schema'

const props = defineProps<{
  tabsKey?: string
  modelValue: FormKitSchemaFormKit[]
  label?: string
  help?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormKitSchemaFormKit[]): void
  (e: 'select', key: string): void
}>()

const { t } = useFormBuilderI18n()
const initial = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

const canvasCtx = useCanvasSchemaContext()
const schemaLibrary = computed(() => canvasCtx?.library as any)
const renderSchemaNode = (node: unknown) => {
  return (canvasCtx?.renderNode ? canvasCtx.renderNode(node) : toCanvasSchemaNode(node as any)) as any
}

const dnd = useContainerDragAndDrop<FormKitSchemaFormKit>({
  modelValue: initial,
  onUpdateModelValue: (value) => {
    const k = props.tabsKey
    if (k && canvasCtx?.updateContainerChildren) canvasCtx.updateContainerChildren(k, value)
    else emit('update:modelValue', value)
  },
})

const activeIndex = ref(0)
watch(
  () => dnd.items.value.length,
  (len) => {
    if (len <= 0) activeIndex.value = 0
    else if (activeIndex.value > len - 1) activeIndex.value = len - 1
  },
  { immediate: true },
)

const selectTab = (idx: number) => {
  activeIndex.value = idx
  const child = dnd.items.value[idx]
  const key = (child as any)?.__key as string | undefined
  if (!key) return
  if (canvasCtx?.selectByKey) canvasCtx.selectByKey(key)
  else emit('select', key)
}

const deleteTab = (idx: number) => {
  const next = dnd.items.value.filter((_, i) => i !== idx)
  dnd.items.value = next
  dnd.emitUpdate()
  if (activeIndex.value >= next.length) activeIndex.value = Math.max(0, next.length - 1)
}

const tabLabel = (child: any, idx: number) => {
  const label = child?.label
  if (typeof label === 'string' && label.trim()) return label.trim()
  const name = child?.name
  if (typeof name === 'string' && name.trim()) return name.trim()
  return `Tab ${idx + 1}`
}

const activeSchema = computed(() => {
  const child = dnd.items.value[activeIndex.value]
  if (!child) return []
  return [renderSchemaNode(child)]
})
</script>

<template>
  <div class="w-full rounded-xl border border-border/50 bg-card/50">
    <div class="flex flex-col gap-0.5 px-3 py-2 border-b border-border/50">
      <div v-if="props.label" class="text-xs text-muted-foreground">{{ props.label }}</div>
      <div v-if="props.help" class="text-[11px] text-muted-foreground">{{ props.help }}</div>
    </div>

    <div class="p-2">
      <ul
        :ref="dnd.containerRef"
        class="w-full flex flex-row flex-wrap gap-1 list-none p-0 m-0 min-h-[38px]"
        :data-tabs-key="props.tabsKey"
        @dragover.capture="dnd.setNestedParentOnRoot(true)"
        @dragend.capture="dnd.setNestedParentOnRoot(false)"
        @drop="dnd.setNestedParentOnRoot(false)"
      >
        <li
          v-for="(child, idx) in dnd.items.value"
          :key="(child as any)?.__key || child.name || `${child.$formkit}-${idx}`"
          class="group relative px-2 py-1 rounded-md border border-border/50 bg-background cursor-grab select-none"
          @pointerdown.stop="selectTab(idx)"
        >
          <span class="text-xs">{{ tabLabel(child, idx) }}</span>
          <n-button
            quaternary
            size="tiny"
            class="absolute -top-2 -right-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto !h-5 !w-5 !p-0"
            draggable="false"
            @pointerdown.stop.prevent
            @click.stop="deleteTab(idx)"
          >
            <template #icon><span class="i-lucide-trash-2 h-3 w-3"></span></template>
          </n-button>
        </li>
        <li v-if="dnd.items.value.length === 0" class="w-full flex items-center justify-center pointer-events-none">
          <n-empty :description="t('builder.listDropHere')" />
        </li>
      </ul>

      <div class="mt-2 w-full">
        <FormKitSchema v-if="activeSchema.length" :schema="activeSchema" :library="schemaLibrary" />
      </div>
    </div>
  </div>
</template>

