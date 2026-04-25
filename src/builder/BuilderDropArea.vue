<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NButtonGroup, NSpin, NCard, NTooltip } from 'naive-ui'
import { FormKitSchema } from '@formkit/vue'
import { customInsertPlugin } from '../utils/custom-insert-plugin'
import { formSchema, selectedIndex, selectedKey } from '../utils/default-form-elements'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { isLoading, canvasView } from '../composables/form-fields'
import { cn } from '../utils/utils'
import { useFormField } from '../composables/form-fields'
import { commitSchema } from '../composables/schema-history'
import ImportExportModal from './ImportExportModal.vue'
import { CardContainer, ListContainer } from './containers'
import { createDefaultInsertPointElement } from '../utils/dnd/insert-point-element'
import { getColSpan as parseColSpan, getRowSpan as parseRowSpan } from '../utils/dnd/grid'
import { collectSchemaNames, ensureUniqueName, generateKey, toSafeName } from '../utils/dnd/schema'
import { findSchemaNodeByKey } from '../composables/form-fields'
import { useFormBuilderI18n } from '@/i18n/context'
import { useRuntimeLocale } from '@/i18n/runtime-locale'
import { pluralize } from '../utils/text'
import { toCanvasSchemaNode } from '../utils/canvas-schema'

const { validationStringLength } = useFormField()

const showImportExportModal = ref(false)
const { setLocale, locale } = useRuntimeLocale()

const { t } = useFormBuilderI18n()

const isZh = computed(() => locale.value === 'zh-CN')
const deleteField = (index: number) => {
  const nextSchema = formSchema.value.filter((_: unknown, i: number) => i !== index)
  commitSchema(nextSchema as FormKitSchemaFormKit[], { reason: 'delete' })
  fields.value = fields.value.filter((_, i) => i !== index)
}

const canonicalBaseName = (value: unknown) => {
  const safe = toSafeName(value)
  const match = safe.match(/^(.*_\d+)_\d+$/)
  return match?.[1] || safe
}

const cloneNodeWithFreshIdentity = (node: any, existingNames: Set<string>) => {
  if (!node || typeof node !== 'object') return node
  const nextKey = generateKey()
  const base = canonicalBaseName(node.name || node.$formkit || 'field')
  const nextName = node.$formkit === 'submit' ? node.name : ensureUniqueName(base, existingNames)
  const next: any = {
    ...node,
    __key: nextKey,
  }
  if (node.$formkit !== 'submit') {
    next.name = nextName
    next.id = `field_${nextKey}`
  }
  if (Array.isArray(node.children)) {
    next.children = node.children.map((c: any) => cloneNodeWithFreshIdentity(c, existingNames))
  }
  return next
}

const updateContainerChildren = (containerKey: string, children: FormKitSchemaFormKit[]) => {
  const currentIndex = formSchema.value.findIndex((n: any) => n?.__key === containerKey)
  if (currentIndex < 0) return
  const current = formSchema.value[currentIndex]
  if (!current) return
  const existingNames = new Set<string>()
  collectSchemaNames(formSchema.value as any, existingNames)
  const ensureIdentity = (node: any): any => {
    if (!node || typeof node !== 'object') return node
    if (node.$formkit === 'submit' && Array.isArray(node.children)) {
      delete node.children
    }
    if (typeof node.__key === 'string' && node.__key) {
      if (Array.isArray(node.children)) node.children = node.children.map((c: any) => ensureIdentity(c))
      return node
    }
    const nextKey = generateKey()
    const base = toSafeName(node.$formkit || node.name || 'field')
    const nextName = node.$formkit === 'submit' ? node.name : ensureUniqueName(base, existingNames)
    const next: any =
      node.$formkit === 'submit'
        ? { ...node, __key: nextKey, outerClass: node.outerClass || 'col-span-12 pt-2' }
        : { ...node, __key: nextKey, name: nextName, id: `field_${nextKey}`, outerClass: node.outerClass || 'col-span-12' }
    if (Array.isArray(node.children)) next.children = node.children.map((c: any) => ensureIdentity(c))
    return next
  }
  const normalizedChildren = children.map((c: any) => ensureIdentity({ ...c }))
  const childKeys = new Set<string>()
  for (const child of normalizedChildren as any[]) {
    const k = child?.__key
    if (typeof k === 'string' && k) childKeys.add(k)
  }

  const prunedSchema = (formSchema.value as any[]).filter((node) => {
    const k = node?.__key
    if (typeof k === 'string' && k) {
      if (k === containerKey) return true
      return !childKeys.has(k)
    }
    return true
  })

  const nextSchema = [...(prunedSchema as FormKitSchemaFormKit[])]
  const nextIndex = nextSchema.findIndex((n: any) => n?.__key === containerKey)
  if (nextIndex < 0) return
  nextSchema[nextIndex] = {
    ...(current as any),
    children: normalizedChildren,
  } as FormKitSchemaFormKit

  commitSchema(nextSchema as FormKitSchemaFormKit[], { reason: 'container-children', merge: true })
}

const duplicateListContainer = (index: number) => {
  const current = formSchema.value[index] as any
  if (!current) return
  const existingNames = new Set<string>()
  collectSchemaNames(formSchema.value as any, existingNames)
  const cloned = cloneNodeWithFreshIdentity(structuredClone(current), existingNames)
  const nextSchema = [...formSchema.value]
  nextSchema.splice(index + 1, 0, cloned)
  commitSchema(nextSchema as FormKitSchemaFormKit[], { reason: 'list-duplicate' })
}

const removeListContainer = (index: number) => {
  deleteField(index)
}

const getColSpan = (field: unknown, index: number): number => {
  return parseColSpan((field as any) ?? formSchema.value[index])
}

const getRowSpan = (field: unknown, index: number): number => {
  return parseRowSpan((field as any) ?? formSchema.value[index])
}

const resizingIndex = ref<number | null>(null)
const resizingPointerId = ref<number | null>(null)
const startX = ref(0)
const startSpan = ref(12)
const columnWidth = ref(0)
const isDragging = ref(false)

// Safelist for Tailwind JIT to properly generate classes for dynamic column spans
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const safelistClasses = [
  'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4',
  'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8',
  'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12',
  'row-span-1', 'row-span-2', 'row-span-3', 'row-span-4', 'row-span-5', 'row-span-6'
]

const startResize = (e: PointerEvent, index: number) => {
  resizingIndex.value = index
  resizingPointerId.value = e.pointerId
  startX.value = e.clientX

  const schemaItem = formSchema.value[index]
  if (!schemaItem) return

  startSpan.value = parseColSpan(schemaItem)

  if (formFields.value) {
    const ul = formFields.value as unknown as HTMLElement
    columnWidth.value = ul.clientWidth / 12
  }

  ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

const setColSpan = (index: number, newSpan: number) => {
  newSpan = Math.max(2, Math.min(12, newSpan))
  newSpan = Math.round(newSpan / 2) * 2

  const schemaItem = formSchema.value[index]
  if (schemaItem) {
    let classes = schemaItem.outerClass || ''
    if (/col-span-\d+/.test(classes)) {
      classes = classes.replace(/col-span-\d+/, `col-span-${newSpan}`)
    } else {
      classes = `${classes} col-span-${newSpan}`.trim()
    }
    schemaItem.outerClass = classes

    if (fields.value[index]) {
      fields.value[index] = {
        ...fields.value[index],
        outerClass: schemaItem.outerClass
      }
    }
  }
}

const onPointerMove = (e: PointerEvent) => {
  if (resizingPointerId.value !== null && e.pointerId !== resizingPointerId.value) return
  const index = resizingIndex.value
  if (index === null) return

  const deltaX = e.clientX - startX.value
  const deltaSpan = Math.round(deltaX / columnWidth.value)
  setColSpan(index, startSpan.value + deltaSpan)
}

const onPointerUp = (e: PointerEvent) => {
  if (resizingPointerId.value !== null && e.pointerId !== resizingPointerId.value) return
  if (resizingIndex.value !== null) {
    commitSchema(formSchema.value, { reason: 'resize' })
  }
  resizingIndex.value = null
  resizingPointerId.value = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

const nudgeResize = (index: number, deltaSpan: number) => {
  const schemaItem = formSchema.value[index]
  if (!schemaItem) return

  const currentSpan = parseColSpan(schemaItem)
  setColSpan(index, currentSpan + deltaSpan)
  commitSchema(formSchema.value, { reason: 'resize' })
}

const clickedField = (index: number) => {
  selectedIndex.value = index
  const key = (formSchema.value[index] as any)?.__key as string | undefined
  selectedKey.value = key ?? null
}

const selectByKey = (key: string) => {
  const found = findSchemaNodeByKey(formSchema.value as any[], key)
  if (!found) return
  selectedIndex.value = found.rootIndex
  selectedKey.value = key
}

const [formFields, fields] = useDragAndDrop<FormKitSchemaFormKit>(formSchema.value, {
  group: 'form-builder',
  nativeDrag: true,
  draggingClass: 'opacity-5 bg-green-400/50',
  accepts: () => true,
  sortable: true,
  draggable: () => true,
  handleNodePointerup(data) {
    data.targetData.node.el.setAttribute('draggable', 'true')
  },
  plugins: [
    customInsertPlugin({
      insertPoint: () => {
        return createDefaultInsertPointElement()
      },
    }),
  ],
})

watch(
  () => formSchema.value,
  (nextSchema) => {
    if (nextSchema !== fields.value) {
      fields.value = [...nextSchema]
    }
  },
)

const schemaLibrary = computed(() => ({
  ListContainerCanvas: ListContainer,
  CardContainerCanvas: CardContainer,
}))

const renderCanvasSchemaNode = (field: any): any => {
  if (!field || typeof field !== 'object') return field
  const key = field.__key as string | undefined
  if (field.$formkit === 'list') {
    return {
      $cmp: 'ListContainerCanvas',
      props: {
        listKey: key,
        modelValue: (Array.isArray(field.children) ? field.children : []) as FormKitSchemaFormKit[],
        label: field.label,
        showActions: false,
        'onUpdate:modelValue': (v: FormKitSchemaFormKit[]) => updateContainerChildren(key ?? '', v),
        onSelect: selectByKey,
      },
    }
  }
  if (field.$formkit === 'card') {
    return {
      $cmp: 'CardContainerCanvas',
      props: {
        cardKey: key,
        modelValue: (Array.isArray(field.children) ? field.children : []) as FormKitSchemaFormKit[],
        label: field.label,
        help: field.help,
        naiveProps: field.naiveProps,
        'onUpdate:modelValue': (v: FormKitSchemaFormKit[]) => updateContainerChildren(key ?? '', v),
        onSelect: selectByKey,
      },
    }
  }
  return toCanvasSchemaNode(field as FormKitSchemaFormKit)
}
</script>

<template>
  <div class="flex flex-1 flex-row justify-start mb-15 pt-10">

    <!-- Left side controls -->
    <div class="w-16 shrink-0 flex flex-col items-center">
      <n-button-group vertical class="sticky top-20 bg-card shadow-sm rounded-lg border border-border/50">
        <n-tooltip placement="right">
          <template #trigger>
            <n-button
              :type="canvasView === 'desktop' ? 'primary' : 'default'"
              :aria-label="t('builder.desktopView')"
              @click="canvasView = 'desktop'"
              size="small"
              class="w-8 h-8"
            >
              <template #icon><span class="i-lucide-monitor h-3.5 w-3.5"></span></template>
            </n-button>
          </template>
          {{ t('builder.desktopView') }}
        </n-tooltip>
        <n-tooltip placement="right">
          <template #trigger>
            <n-button
              :type="canvasView === 'tablet' ? 'primary' : 'default'"
              :aria-label="t('builder.tabletView')"
              @click="canvasView = 'tablet'"
              size="small"
              class="w-8 h-8"
            >
              <template #icon><span class="i-lucide-tablet h-3.5 w-3.5"></span></template>
            </n-button>
          </template>
          {{ t('builder.tabletView') }}
        </n-tooltip>
        <n-tooltip placement="right">
          <template #trigger>
            <n-button
              :type="canvasView === 'mobile' ? 'primary' : 'default'"
              :aria-label="t('builder.mobileView')"
              @click="canvasView = 'mobile'"
              size="small"
              class="w-8 h-8"
            >
              <template #icon><span class="i-lucide-smartphone h-3.5 w-3.5"></span></template>
            </n-button>
          </template>
          {{ t('builder.mobileView') }}
        </n-tooltip>
      </n-button-group>
    </div>

    <!-- Center Canvas Area -->
    <div class="flex-1 flex justify-center px-4 relative">
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-50">
        <div class="flex flex-col items-center bg-white dark:bg-neutral-600 justify-center gap-3 p-4 rounded-lg shadow-md">
          <span class="font-medium text-sm text-zinc-700 dark:text-zinc-300">{{ t('builder.creatingForm') }}</span>
          <n-spin size="medium" />
        </div>
      </div>

      <n-card
        :class="cn(
          'relative min-h-[80%] !h-fit rounded-xl shadow-md transition-[width] duration-300 flex flex-col',
          canvasView === 'desktop' ? 'w-full lg:w-[80%]' : '',
          canvasView === 'tablet' ? 'w-[768px]' : '',
          canvasView === 'mobile' ? 'w-[375px]' : ''
        )"
        content-style="padding: 16px; flex: 1; display: flex; flex-direction: column;"
      >
        <!-- 保留原生 ul 以确保 useDragAndDrop ref 绑定正常工作 -->
        <ul
          ref="formFields"
          :class="cn(
            'w-full grid grid-cols-12 gap-x-4 gap-y-2 list-none p-0 m-0 flex-1',
            fields.length === 0 ? 'min-h-[200px] h-full' : 'h-fit',
          )"
          @dragstart.capture="isDragging = true"
          @dragend.capture="isDragging = false"
          @drop.capture="isDragging = false"
          data-testid="drop-area"
        >
          <li
            v-for="(field, index) in fields"
            :key="(field as any)?.__key || (field as FormKitSchemaFormKit)?.name || (field as FormKitSchemaFormKit)?.$formkit + index"
            :class="cn(
            'group rounded-xl transition-[border-color,background-color,box-shadow] duration-150',
            'px-2 py-1 !cursor-grab h-full !z-20 relative border-[1.5px]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a277ff] focus-visible:ring-offset-2',
            ((field as any)?.__key && (field as any).__key === selectedKey) || selectedIndex === index
              ? 'border-solid border-[#a277ff] bg-[#a277ff]/[0.05] shadow-[0_0_0_3px_rgba(79,110,247,0.12)] dark:bg-[#a277ff]/[0.08]'
              : 'border-dashed border-transparent hover:border-[#7c9ef8] hover:bg-[#f0f4ff] dark:hover:bg-[rgba(100,130,255,0.07)]',
          )"
          :style="{
            gridColumn: `span ${getColSpan(field, index)} / span ${getColSpan(field, index)}`,
            gridRow: `span ${getRowSpan(field, index)} / span ${getRowSpan(field, index)}`,
          }"
          tabindex="0"
          @pointerdown="clickedField(index)"
          @keydown.enter.stop.prevent="clickedField(index)"
          @keydown.space.stop.prevent="clickedField(index)"
          >
            <!-- Field content -->
            <div class="flex gap-1.5 w-full pb-2">
              <div class="flex-1 w-full">
                <FormKitSchema
                  :schema="[renderCanvasSchemaNode(field)]"
                  :library="schemaLibrary"
                  :key="`${(field as any)?.__key ?? (field as FormKitSchemaFormKit)?.name ?? index}-${(field as FormKitSchemaFormKit)?.$formkit ?? 'unknown'}`"
                />
              </div>
            </div>

            <!-- Bottom controls: validation rules count + delete button -->
            <div class="absolute bottom-1 right-1 flex flex-row z-40">
              <div
                class="px-2 mr-1 border-1 border-ring/40 dark:border-ring/20 rounded-md flex items-center justify-center"
                v-if="selectedIndex === index"
              >
                <span class="text-xs">
                  {{ validationStringLength }} {{ pluralize(validationStringLength, 'rule') }}
                </span>
              </div>
              <n-button
                quaternary
                size="small"
                :aria-label="t('builder.deleteField')"
                @click.stop="deleteField(index)"
                class="!h-[26px] !w-[26px] !rounded-[7px] !text-muted-foreground
                      hover:!bg-red-100 hover:!text-red-600
                      active:!scale-95 active:!bg-red-200 active:!text-red-700
                      dark:hover:!bg-red-950/50 dark:hover:!text-red-400
                      transition-all duration-150"
              >
                <template #icon><span class="i-lucide-trash-2 !h-[13px] !w-[13px]"></span></template>
              </n-button>
            </div>

            <!-- Resize handle -->
            <n-button
              text
              size="small"
              class="absolute top-1/2 -translate-y-1/2 -right-3 z-30
                    opacity-0 pointer-events-none
                    group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-all duration-150
                    !cursor-ew-resize"
              content-class="!cursor-ew-resize"
              :class="resizingIndex === index
                ? '!opacity-100 scale-110'
                : isDragging ? '!opacity-0 !pointer-events-none' : ''"
              @pointerdown.stop.prevent="startResize($event, index)"
              @keydown.left.stop.prevent="nudgeResize(index, -2)"
              @keydown.right.stop.prevent="nudgeResize(index, 2)"
            >
              <template #icon>
                <span class="i-lucide-more-vertical h-5 w-5"></span>
              </template>
            </n-button>

            <!-- 拖拽宽度遮罩 -->
            <div
              v-if="resizingIndex === index"
              class="absolute inset-0 z-40 bg-[#a277ff]/[0.06] flex items-center justify-center rounded-xl border-[1.5px] border-[#a277ff]/50"
            >
              <span class="bg-[#a277ff] text-white text-xs font-medium px-2.5 py-1 rounded-lg tracking-wide">
                {{ (getColSpan(field, index) / 12 * 100).toFixed(0) }}%
              </span>
            </div>
          </li>
        </ul>
      </n-card>
    </div>

    <!-- Right side controls -->
    <div class="w-16 shrink-0 hidden md:flex flex-col items-center">
      <div class="sticky top-20 flex flex-col gap-2">
        <n-button-group vertical class="bg-card shadow-sm rounded-lg border border-border/50">
          <n-tooltip placement="left">
            <template #trigger>
              <n-button
                @click="showImportExportModal = true"
                size="small"
                :aria-label="t('builder.importExportSchema')"
                class="w-8 h-8"
              >
                <template #icon><span class="i-lucide-code-xml h-3.5 w-3.5"></span></template>
              </n-button>
            </template>
            {{ t('builder.importExportSchema') }}
          </n-tooltip>
        </n-button-group>

        <n-button-group vertical class="bg-card shadow-sm rounded-lg border border-border/50">
          <n-button
            size="small"
            class="w-8 h-8"
            :type="isZh ? 'primary' : 'default'"
            aria-label="切换到中文"
            @click="setLocale('zh-CN')"
          >
            中
          </n-button>
          <n-button
            size="small"
            class="w-8 h-8"
            :type="!isZh ? 'primary' : 'default'"
            aria-label="Switch to English"
            @click="setLocale('en')"
          >
            EN
          </n-button>
        </n-button-group>
      </div>
    </div>

    <ImportExportModal v-model:show="showImportExportModal" />
  </div>
</template>
