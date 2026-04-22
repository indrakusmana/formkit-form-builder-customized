<script setup lang="ts">
import { computed, watch } from 'vue'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { FormKitSchema } from '@formkit/vue'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { NButton, NButtonGroup, NList, NListItem, NThing, NTooltip } from 'naive-ui'
import { useFormBuilderI18n } from '../../../i18n/context'

const props = defineProps<{
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

const [containerRef, items] = useDragAndDrop<FormKitSchemaFormKit>(initial.value, {
  group: 'form-builder',
  nativeDrag: true,
  accepts: () => true,
  sortable: true,
  draggable: () => true,
  handleParentDragover(data) {
    data.e.preventDefault()
  },
  handleNodeDragover(data) {
    data.e.preventDefault()
  },
  handleNodePointerup(data) {
    data.targetData.node.el.setAttribute('draggable', 'true')
  },
})

watch(
  () => props.modelValue,
  (next) => {
    if (Array.isArray(next) && next !== items.value) items.value = [...next]
  },
  { deep: true },
)

watch(
  items,
  (next) => {
    emit('update:modelValue', [...next])
  },
  { deep: true },
)

const showActions = computed(() => props.showActions === true)

const onSelect = (child: any) => {
  const key = child?.__key as string | undefined
  if (key) emit('select', key)
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
      <div
        v-if="items.length === 0"
        ref="containerRef"
        class="min-h-[96px] rounded-lg border-2 border-dashed border-border/50 bg-muted/20 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-1 text-muted-foreground">
          <span class="i-lucide-list h-5 w-5 opacity-70"></span>
          <div class="text-xs">{{ t('builder.listDropHere') }}</div>
        </div>
      </div>
      <n-list v-else bordered class="rounded-lg">
        <div ref="containerRef">
          <n-list-item
            v-for="(child, idx) in items"
            :key="(child as any)?.__key || child.name || `${child.$formkit}-${idx}`"
            class="cursor-grab"
            @pointerdown.stop="onSelect(child)"
          >
            <n-thing>
              <FormKitSchema :schema="[child]" :key="`list-child-${idx}`" />
            </n-thing>
          </n-list-item>
        </div>
      </n-list>
    </div>
  </div>
</template>
