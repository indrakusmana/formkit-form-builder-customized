<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NButtonGroup, NSpin, NCard, NTooltip } from 'naive-ui'
import { customInsertPlugin } from '../utils/custom-insert-plugin'
import { formSchema, selectedIndex, selectedKey } from '../utils/default-form-elements'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { isLoading, canvasView } from '../composables/form-fields'
import { cn } from '../utils/utils'
import { commitSchema } from '../composables/schema-history'
import ImportExportModal from './ImportExportModal.vue'
import { canvasSchemaLibrary } from './containers'
import { createDefaultInsertPointElement } from '../utils/dnd/insert-point-element'
import { collectSchemaNames, ensureUniqueName, generateKey, toSafeName } from '../utils/dnd/schema'
import { findSchemaNodeByKey } from '../composables/form-fields'
import { useFormBuilderI18n } from '@/i18n/context'
import { useRuntimeLocale } from '@/i18n/runtime-locale'
import { toCanvasSchemaNode } from '../utils/canvas-schema'
import { provideCanvasSchemaContext } from './composables/canvas-schema-context'
import { normalizeContainerNode } from '@/containers/registry'
import ContainerChildrenGrid from '@/components/ui/containers/shared/ContainerChildrenGrid.vue'

const showImportExportModal = ref(false)
const { setLocale, locale } = useRuntimeLocale()

const { t } = useFormBuilderI18n()

const isZh = computed(() => locale.value === 'zh-CN')
const deleteField = (index: number) => {
  const nextSchema = formSchema.value.filter((_: unknown, i: number) => i !== index)
  commitSchema(nextSchema as FormKitSchemaFormKit[], { reason: 'delete' })
  fields.value = fields.value.filter((_, i) => i !== index)
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
  const merged: any = {
    ...(current as any),
    children: normalizedChildren,
  }
  if (merged.$cmp) {
    merged.props = { ...merged.props, modelValue: normalizedChildren }
  }
  nextSchema[nextIndex] = merged as FormKitSchemaFormKit

  commitSchema(nextSchema as FormKitSchemaFormKit[], { reason: 'container-children', merge: true })
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

const rootGrid = { containerRef: formFields, items: fields }

watch(
  () => formSchema.value,
  (nextSchema) => {
    if (nextSchema !== fields.value) {
      fields.value = [...nextSchema]
    }
  },
)

const dropAreaUlClass = computed(() =>
  cn(
    'w-full grid grid-cols-12 gap-x-4 gap-y-2 list-none p-0 m-0 flex-1',
    fields.value.length === 0 ? 'min-h-[200px] h-full' : 'h-fit',
  ),
)

const onSelectRoot = (child: FormKitSchemaFormKit, index: number) => {
  const key = (child as any)?.__key as string | undefined
  if (key) selectByKey(key)
  else selectedIndex.value = index
}

const onResizeEnd = () => {
  commitSchema(fields.value as FormKitSchemaFormKit[], { reason: 'resize', merge: true })
}

const schemaLibrary = canvasSchemaLibrary

const renderCanvasSchemaNode = (field: any): any => {
  if (!field || typeof field !== 'object') return field
  const next = normalizeContainerNode(field)
  return toCanvasSchemaNode(next as FormKitSchemaFormKit)
}

provideCanvasSchemaContext({
  library: schemaLibrary,
  renderNode: renderCanvasSchemaNode,
  updateContainerChildren,
  selectByKey,
})
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
        <ContainerChildrenGrid
          :container-ref="rootGrid.containerRef"
          :items="rootGrid.items"
          :selected-key="selectedKey"
          :empty-text="t('builder.listDropHere')"
          :delete-aria-label="t('builder.deleteField')"
          :data-attrs="{ 'data-testid': 'drop-area' }"
          :ul-class="dropAreaUlClass"
          :on-select="onSelectRoot"
          :on-delete="deleteField"
          :on-resize-end="onResizeEnd"
        />
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
