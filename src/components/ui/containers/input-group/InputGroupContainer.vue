<script setup lang="ts">
import { computed } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { FormKitSchema } from '@formkit/vue'
import { NInputGroup, NButton, NTooltip, NEmpty } from 'naive-ui'
import { useFormBuilderI18n } from '@/i18n/context'
import { selectedKey } from '@/utils/default-form-elements'
import { useContainerDragAndDrop } from '@/builder/composables/use-container-drag-and-drop'
import { toCanvasSchemaNode } from '@/utils/canvas-schema'
import { useCanvasSchemaContext } from '@/builder/composables/canvas-schema-context'
import { pluralize, validationCount } from '@/utils/text'

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

const schemaLibrary = computed(() => canvasCtx?.library as any)
const renderSchemaNode = (node: unknown) => {
  return (canvasCtx?.renderNode ? canvasCtx.renderNode(node) : toCanvasSchemaNode(node as any)) as any
}

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
        <ul
          :ref="dnd.containerRef"
          class="w-full flex flex-row flex-nowrap items-stretch gap-2 list-none p-0 m-0 overflow-x-auto"
          :data-input-group-key="props.inputGroupKey"
          data-dnd-axis="x"
          @dragover.capture="dnd.setNestedParentOnRoot(true)"
          @dragstart.capture
          @dragend.capture="dnd.setNestedParentOnRoot(false)"
          @drop="dnd.setNestedParentOnRoot(false)"
          :class="dnd.items.value.length === 0 ? 'min-h-[56px] bg-muted/20 rounded-lg p-3' : ''"
        >
          <li
            v-for="(child, idx) in dnd.items.value"
            :key="(child as any)?.__key || child.name || `${child.$formkit}-${idx}`"
            class="group relative rounded-xl transition-[border-color,background-color,box-shadow] duration-150 border-[1.5px] px-2 py-2 min-w-[140px]"
            :class="[
              ((child as any)?.__key && (child as any).__key === selectedKey)
                ? 'border-solid border-[#a277ff] bg-[#a277ff]/[0.05] shadow-[0_0_0_3px_rgba(79,110,247,0.12)] dark:bg-[#a277ff]/[0.08]'
                : 'border-dashed border-transparent hover:border-[#7c9ef8] hover:bg-[#f0f4ff] dark:hover:bg-[rgba(100,130,255,0.07)]',
            ]"
            tabindex="0"
            @pointerdown.stop="onSelect(child, idx)"
            @keydown.enter.stop.prevent="onSelect(child, idx)"
            @keydown.space.stop.prevent="onSelect(child, idx)"
          >
            <div class="w-full">
              <FormKitSchema :schema="[renderSchemaNode(child)]" :library="schemaLibrary" :key="`input-group-child-${idx}`" />
            </div>

            <div class="absolute top-2 right-2 flex flex-row z-40">
              <div
                v-if="(child as any)?.__key && (child as any).__key === selectedKey"
                class="px-2 mr-1 border-1 border-ring/40 dark:border-ring/20 rounded-md flex items-center justify-center"
              >
                <span class="text-xs">
                  {{ validationCount(child) }} {{ pluralize(validationCount(child), 'rule') }}
                </span>
              </div>

              <n-tooltip placement="top">
                <template #trigger>
                  <n-button
                    quaternary
                    size="small"
                    :aria-label="t('builder.deleteField')"
                    draggable="false"
                    @pointerdown.stop.prevent
                    @click.stop="deleteChild(idx)"
                    class="!h-[26px] !w-[26px] !rounded-[7px] !text-muted-foreground
                          hover:!bg-red-100 hover:!text-red-600
                          active:!scale-95 active:!bg-red-200 active:!text-red-700
                          dark:hover:!bg-red-950/50 dark:hover:!text-red-400
                          transition-all duration-150"
                  >
                    <template #icon><span class="i-lucide-trash-2 !h-[13px] !w-[13px]"></span></template>
                  </n-button>
                </template>
                {{ t('builder.deleteField') }}
              </n-tooltip>
            </div>
          </li>
        </ul>
      </n-input-group>

      <div v-if="dnd.items.value.length === 0" class="pt-3">
        <n-empty :description="t('builder.listDropHere')" />
      </div>
    </div>
  </div>
</template>

