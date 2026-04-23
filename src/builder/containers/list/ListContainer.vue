<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { FormKitSchema } from '@formkit/vue'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { parents, setParentValues } from '@formkit/drag-and-drop'
import { customInsertPlugin } from '../../../utils/custom-insert-plugin'
import { NButton, NButtonGroup, NTooltip } from 'naive-ui'
import { useFormBuilderI18n } from '../../../i18n/context'
import { selectedKey } from '../../../utils/default-form-elements'
import { eq } from '../../../utils/utils'

const props = defineProps<{
  listKey?: string
  modelValue: FormKitSchemaFormKit[]
  disabled?: boolean
  showActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormKitSchemaFormKit[]): void
  (e: 'duplicate'): void
  (e: 'remove'): void
  (e: 'select', key: string): void
}>()

const { t } = useFormBuilderI18n()

const initial = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

const isDragging = ref(false)
const resizingIndex = ref<number | null>(null)
const resizingPointerId = ref<number | null>(null)
const startX = ref(0)
const startSpan = ref(12)
const columnWidth = ref(0)

const [containerRef, items] = useDragAndDrop<FormKitSchemaFormKit>(initial.value, {
  group: 'form-builder',
  nativeDrag: true,
  accepts: () => true,
  sortable: true,
  draggable: () => true,
  plugins: [
    customInsertPlugin({
      insertPoint: () => {
        const div = document.createElement('div')
        div.classList.add('absolute', 'bg-green-500', 'z-[2000]', 'rounded-sm', 'pointer-events-none', 'opacity-90')
        return div
      },
    }),
  ],
  handleNodePointerup(data) {
    data.targetData.node.el.setAttribute('draggable', 'true')
  },
})

const syncingFromProps = ref(false)

watch(
  () => props.modelValue,
  (next) => {
    if (!Array.isArray(next)) return
    if (eq(next, items.value)) return
    syncingFromProps.value = true
    const el = (containerRef.value as unknown as HTMLElement | null) ?? null
    const data = el ? parents.get(el) : undefined
    if (el && data) {
      setParentValues(el, data, [...next] as any)
    } else {
      items.value = [...next]
    }
    queueMicrotask(() => {
      syncingFromProps.value = false
    })
  },
  { deep: true },
)

const emitUpdate = () => {
  if (syncingFromProps.value) return
  emit('update:modelValue', [...items.value])
}

const showActions = computed(() => props.showActions === true)

const onSelect = (child: any) => {
  const key = child?.__key as string | undefined
  if (key) emit('select', key)
}

const pluralize = (count: number, noun: string, suffix = 's') => {
  return count === 1 ? noun : noun + suffix
}

const getColSpan = (field: unknown): number => {
  const outerClass = (field as FormKitSchemaFormKit)?.outerClass || ''
  const match = typeof outerClass === 'string' ? outerClass.match(/col-span-(\d+)/) : null
  return match ? parseInt(match[1]!, 10) : 12
}

const getRowSpan = (field: unknown): number => {
  const outerClass = (field as FormKitSchemaFormKit)?.outerClass || ''
  const match = typeof outerClass === 'string' ? outerClass.match(/row-span-(\d+)/) : null
  return match ? parseInt(match[1]!, 10) : 1
}

const setColSpan = (index: number, nextSpan: number) => {
  const field = items.value[index]
  if (!field) return
  const span = Math.max(1, Math.min(12, Math.round(nextSpan)))
  const currentOuterClass = typeof field.outerClass === 'string' ? field.outerClass : ''
  let classes = currentOuterClass
  if (/\bcol-span-\d+\b/.test(classes)) {
    classes = classes.replace(/\bcol-span-\d+\b/g, `col-span-${span}`).replace(/\s+/g, ' ').trim()
  } else {
    classes = `${classes} col-span-${span}`.replace(/\s+/g, ' ').trim()
  }
  const next = [...items.value]
  next[index] = { ...(field as any), outerClass: classes || undefined } as FormKitSchemaFormKit
  items.value = next
}

const startResize = (e: PointerEvent, index: number) => {
  resizingIndex.value = index
  resizingPointerId.value = e.pointerId
  startX.value = e.clientX
  startSpan.value = getColSpan(items.value[index])
  const el = (containerRef.value as unknown as HTMLElement | null) ?? null
  if (el) {
    const rect = el.getBoundingClientRect()
    columnWidth.value = rect.width / 12
  }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

const onPointerMove = (e: PointerEvent) => {
  if (resizingIndex.value === null) return
  if (resizingPointerId.value !== null && e.pointerId !== resizingPointerId.value) return
  if (!columnWidth.value) return
  const deltaX = e.clientX - startX.value
  const deltaSpan = Math.round(deltaX / columnWidth.value)
  setColSpan(resizingIndex.value, startSpan.value + deltaSpan)
}

const onPointerUp = (e: PointerEvent) => {
  if (resizingPointerId.value !== null && e.pointerId !== resizingPointerId.value) return
  resizingIndex.value = null
  resizingPointerId.value = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  emitUpdate()
}

const validationCount = (field: any) => {
  const raw = field?.validation
  if (typeof raw !== 'string') return 0
  const parts = raw.split('|').map((s) => s.trim()).filter(Boolean)
  return parts.length
}

const deleteChild = (index: number) => {
  const next = items.value.filter((_, i) => i !== index)
  items.value = next
  emitUpdate()
}
</script>

<template>
  <div class="w-full rounded-xl border border-border/50 bg-card/50">
    <div class="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <div class="text-xs text-muted-foreground">{{ t('builder.listContainer') }}</div>
      <n-button-group v-if="showActions">
        <n-tooltip placement="top">
          <template #trigger>
            <n-button quaternary size="small" :disabled="disabled" @click.stop="emit('duplicate')">
              <template #icon><span class="i-lucide-plus h-4 w-4"></span></template>
            </n-button>
          </template>
          {{ t('builder.listAdd') }}
        </n-tooltip>
        <n-tooltip placement="top">
          <template #trigger>
            <n-button quaternary size="small" :disabled="disabled" @click.stop="emit('remove')">
              <template #icon><span class="i-lucide-trash-2 h-4 w-4"></span></template>
            </n-button>
          </template>
          {{ t('builder.listRemove') }}
        </n-tooltip>
      </n-button-group>
    </div>

    <div class="p-2">
      <div class="relative">
        <ul
          ref="containerRef"
          class="w-full grid grid-cols-12 gap-x-4 gap-y-2 list-none p-2 m-0 min-h-[140px]"
          :data-list-key="props.listKey"
          @dragstart.capture="isDragging = true"
          @dragend.capture="isDragging = false"
          @drop="isDragging = false"
          :class="items.length === 0 ? 'border-2 border-dashed border-border/50 bg-muted/20 rounded-lg' : ''"
        >
          <li
            v-for="(child, idx) in items"
            :key="(child as any)?.__key || child.name || `${child.$formkit}-${idx}`"
            :class="[
              'group rounded-xl transition-[border-color,background-color,box-shadow] duration-150',
              'p-1 !cursor-grab h-full !z-20 relative border-[1.5px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a277ff] focus-visible:ring-offset-2',
              ((child as any)?.__key && (child as any).__key === selectedKey)
                ? 'border-solid border-[#a277ff] bg-[#a277ff]/[0.05] shadow-[0_0_0_3px_rgba(79,110,247,0.12)] dark:bg-[#a277ff]/[0.08]'
                : 'border-dashed border-transparent hover:border-[#7c9ef8] hover:bg-[#f0f4ff] dark:hover:bg-[rgba(100,130,255,0.07)]',
            ]"
            :style="{
              gridColumn: `span ${getColSpan(child)} / span ${getColSpan(child)}`,
              gridRow: `span ${getRowSpan(child)} / span ${getRowSpan(child)}`,
            }"
            tabindex="0"
            @pointerdown.stop="onSelect(child)"
          >
            <div class="p-1 w-full">
              <FormKitSchema :schema="[child]" :key="`list-child-${idx}`" />
            </div>

            <div class="absolute bottom-1 right-1 flex flex-row z-40">
              <div
                v-if="(child as any)?.__key && (child as any).__key === selectedKey"
                class="px-2 mr-1 border-1 border-ring/40 dark:border-ring/20 rounded-md flex items-center justify-center"
              >
                <span class="text-xs">
                  {{ validationCount(child) }} {{ pluralize(validationCount(child), 'rule') }}
                </span>
              </div>
              <n-button
                quaternary
                size="small"
                :aria-label="t('builder.deleteField')"
                @click.stop="deleteChild(idx)"
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

        <div
          v-if="items.length === 0"
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div class="flex flex-col items-center gap-1 text-muted-foreground">
            <span class="i-lucide-list h-5 w-5 opacity-70"></span>
            <div class="text-xs">{{ t('builder.listDropHere') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
