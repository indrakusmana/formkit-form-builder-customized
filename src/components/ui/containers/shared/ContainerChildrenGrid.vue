<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { FormKitSchema } from '@formkit/vue'
import { NButton, NTooltip, NEmpty } from 'naive-ui'
import { getColSpan, getRowSpan } from '@/utils/dnd/grid'
import { toCanvasSchemaNode } from '@/utils/canvas-schema'
import { useCanvasSchemaContext } from '@/builder/composables/canvas-schema-context'
import { pluralize, validationCount } from '@/utils/text'
import { useGridSpanResize } from '@/builder/composables/use-grid-span-resize'

type InsertDirections = Partial<Record<'left' | 'right' | 'top' | 'bottom', boolean>>

const props = defineProps<{
  containerRef: Ref<unknown>
  items: Ref<FormKitSchemaFormKit[]>
  selectedKey: string | null
  emptyText: string
  deleteAriaLabel: string
  showDeleteTooltip?: boolean
  deleteTooltipText?: string
  dataAttrs?: Record<string, string | number | boolean | undefined>
  ulClass?: string
  allowedInsertDirections?: InsertDirections
  setNestedParentOnRoot?: (active: boolean) => void
  onSelect: (child: FormKitSchemaFormKit, index: number) => void
  onDelete: (index: number) => void
  onResizeEnd: () => void
}>()

const isDragging = ref(false)

const canvasCtx = useCanvasSchemaContext()
const schemaLibrary = computed(() => canvasCtx?.library as any)
const renderSchemaNode = (node: unknown) => {
  return (canvasCtx?.renderNode ? canvasCtx.renderNode(node) : toCanvasSchemaNode(node as any)) as any
}

const tailwindSafelist = [
  'col-span-1',
  'col-span-2',
  'col-span-3',
  'col-span-4',
  'col-span-5',
  'col-span-6',
  'col-span-7',
  'col-span-8',
  'col-span-9',
  'col-span-10',
  'col-span-11',
  'col-span-12',
  'row-span-1',
  'row-span-2',
  'row-span-3',
  'row-span-4',
  'row-span-5',
  'row-span-6',
]
void tailwindSafelist

const { resizingIndex, startResize } = useGridSpanResize({
  items: props.items,
  containerRef: props.containerRef,
  onResizeEnd: props.onResizeEnd,
})

const axis = computed(() => {
  const dirs = props.allowedInsertDirections
  const left = dirs?.left !== false
  const right = dirs?.right !== false
  const top = dirs?.top !== false
  const bottom = dirs?.bottom !== false
  const allowHorizontal = left || right
  const allowVertical = top || bottom
  if (allowHorizontal && !allowVertical) return 'x'
  if (allowVertical && !allowHorizontal) return 'y'
  return undefined
})
</script>

<template>
  <div class="relative">
    <ul
      :ref="props.containerRef"
      :class="[
        'w-full grid grid-cols-12 gap-x-4 gap-y-2 list-none p-2 m-0',
        props.ulClass,
        props.items.value.length === 0 ? 'min-h-[140px] bg-muted/20 rounded-lg' : '',
      ]"
      :data-dnd-axis="axis"
      v-bind="props.dataAttrs"
      @dragover.capture="props.setNestedParentOnRoot?.(true)"
      @dragstart.capture="isDragging = true"
      @dragend.capture="isDragging = false; props.setNestedParentOnRoot?.(false)"
      @drop="isDragging = false; props.setNestedParentOnRoot?.(false)"
    >
      <li
        v-for="(child, idx) in props.items.value"
        :key="(child as any)?.__key || child.name || `${child.$formkit}-${idx}`"
        :class="[
          'group rounded-xl transition-[border-color,background-color,box-shadow] duration-150',
          'px-2 py-1 pr-4 !cursor-grab h-full !z-20 relative border-[1.5px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a277ff] focus-visible:ring-offset-2',
          ((child as any)?.__key && (child as any).__key === props.selectedKey)
            ? 'border-solid border-[#a277ff] bg-[#a277ff]/[0.05] shadow-[0_0_0_3px_rgba(79,110,247,0.12)] dark:bg-[#a277ff]/[0.08]'
            : 'border-dashed border-transparent hover:border-[#7c9ef8] hover:bg-[#f0f4ff] dark:hover:bg-[rgba(100,130,255,0.07)]',
        ]"
        :style="{
          gridColumn: `span ${getColSpan(child)} / span ${getColSpan(child)}`,
          gridRow: `span ${getRowSpan(child)} / span ${getRowSpan(child)}`,
        }"
        tabindex="0"
        @pointerdown.stop="props.onSelect(child, idx)"
        @keydown.enter.stop.prevent="props.onSelect(child, idx)"
        @keydown.space.stop.prevent="props.onSelect(child, idx)"
      >
        <div class="flex gap-1.5 p-1 w-full pb-2">
          <div class="flex-1 w-full">
            <FormKitSchema
              :schema="[renderSchemaNode(child)]"
              :library="schemaLibrary"
              :key="`container-child-${idx}`"
            />
          </div>
        </div>

        <div class="absolute bottom-2 right-2 flex flex-row z-40">
          <div
            v-if="(child as any)?.__key && (child as any).__key === props.selectedKey"
            class="px-2 mr-1 border-1 border-ring/40 dark:border-ring/20 rounded-md flex items-center justify-center"
          >
            <span class="text-xs">
              {{ validationCount(child) }} {{ pluralize(validationCount(child), 'rule') }}
            </span>
          </div>

          <n-tooltip v-if="props.showDeleteTooltip" placement="top">
            <template #trigger>
              <n-button
                quaternary
                size="small"
                :aria-label="props.deleteAriaLabel"
                draggable="false"
                @pointerdown.stop.prevent
                @click.stop="props.onDelete(idx)"
                class="!h-[26px] !w-[26px] !rounded-[7px] !text-muted-foreground
                      hover:!bg-red-100 hover:!text-red-600
                      active:!scale-95 active:!bg-red-200 active:!text-red-700
                      dark:hover:!bg-red-950/50 dark:hover:!text-red-400
                      transition-all duration-150"
              >
                <template #icon><span class="i-lucide-trash-2 !h-[13px] !w-[13px]"></span></template>
              </n-button>
            </template>
            {{ props.deleteTooltipText }}
          </n-tooltip>

          <n-button
            v-else
            quaternary
            size="small"
            :aria-label="props.deleteAriaLabel"
            draggable="false"
            @pointerdown.stop.prevent
            @click.stop="props.onDelete(idx)"
            class="!h-[26px] !w-[26px] !rounded-[7px] !text-muted-foreground
                  hover:!bg-red-100 hover:!text-red-600
                  active:!scale-95 active:!bg-red-200 active:!text-red-700
                  dark:hover:!bg-red-950/50 dark:hover:!text-red-400
                  transition-all duration-150"
          >
            <template #icon><span class="i-lucide-trash-2 !h-[13px] !w-[13px]"></span></template>
          </n-button>
        </div>

        <n-button
          text
          size="small"
          class="absolute top-1/2 -translate-y-1/2 -right-3 z-30
                opacity-0 pointer-events-none
                group-hover:opacity-100 group-hover:pointer-events-auto
                transition-all duration-150
                !cursor-ew-resize"
          content-class="!cursor-ew-resize"
          :class="resizingIndex === idx
            ? '!opacity-100 scale-110'
            : isDragging ? '!opacity-0 !pointer-events-none' : ''"
          @pointerdown.stop.prevent="startResize($event, idx)"
        >
          <template #icon>
            <span class="i-lucide-more-vertical h-5 w-5"></span>
          </template>
        </n-button>

        <div
          v-if="resizingIndex === idx"
          class="absolute inset-0 z-40 bg-[#a277ff]/[0.06] flex items-center justify-center rounded-xl border-[1.5px] border-[#a277ff]/50"
        >
          <span class="bg-[#a277ff] text-white text-xs font-medium px-2.5 py-1 rounded-lg tracking-wide">
            {{ (getColSpan(child) / 12 * 100).toFixed(0) }}%
          </span>
        </div>
      </li>
    </ul>

    <div v-if="props.items.value.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <n-empty :description="props.emptyText" />
    </div>
  </div>
</template>
