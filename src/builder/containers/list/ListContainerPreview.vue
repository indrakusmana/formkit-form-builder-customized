<script setup lang="ts">
import type { FormKitSchemaFormKit } from '@formkit/core'
import { inject, computed } from 'vue'
import { FormKitSchema } from '@formkit/vue'
import { NButton, NButtonGroup, NTooltip, NEmpty } from 'naive-ui'
import { useFormBuilderI18n } from '../../../i18n/context'

const props = defineProps<{
  nodeKey: string
  children: FormKitSchemaFormKit[]
  label?: string
  isPlaceholder?: boolean
}>()

const duplicate = inject(
  'previewListDuplicate',
  null as unknown as ((key: string) => void) | null,
)
const isLast = inject(
  'previewListIsLast',
  null as unknown as ((key: string) => boolean) | null,
)
const remove = inject(
  'previewListRemove',
  null as unknown as ((key: string) => void) | null,
)
const restore = inject(
  'previewListRestore',
  null as unknown as ((key: string) => void) | null,
)

const { t } = useFormBuilderI18n()

const title = computed(() => (typeof props.label === 'string' && props.label.trim() ? props.label.trim() : ''))
const showHeader = computed(() => !!title.value || props.isPlaceholder !== true)
const modelValue = computed(() => (Array.isArray(props.children) ? props.children : []))
const showAddButton = computed(() => props.isPlaceholder !== true && (isLast ? isLast(props.nodeKey) : true))
const wrapperClass = computed(() => (showAddButton.value ? 'p-2 relative pb-10' : 'p-2'))
</script>

<template>
  <div class="w-full rounded-xl border border-border/50 bg-card/50">
    <div v-if="showHeader" class="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <div v-if="title" class="text-xs text-muted-foreground">{{ title }}</div>
      <n-button-group v-if="props.isPlaceholder !== true" class="shrink-0">
        <n-tooltip placement="top">
          <template #trigger>
            <n-button quaternary size="small" @click.stop="remove?.(props.nodeKey)">
              <template #icon><span class="i-lucide-trash-2 h-4 w-4"></span></template>
            </n-button>
          </template>
          {{ t('builder.listRemove') }}
        </n-tooltip>
      </n-button-group>
    </div>

    <div :class="wrapperClass">
      <div v-if="props.isPlaceholder === true" class="min-h-[140px] flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">
          <n-empty :description="t('builder.listRemove')" />
          <n-button secondary @click="restore?.(props.nodeKey)">
            <template #icon><span class="i-lucide-plus h-4 w-4"></span></template>
            {{ t('builder.addListContainer') }}
          </n-button>
        </div>
      </div>
      <div v-else class="w-full grid grid-cols-12 gap-x-4 gap-y-2">
        <FormKitSchema v-if="modelValue.length" :schema="modelValue" />
        <n-empty v-else :description="t('builder.listDropHere')" />
      </div>
      <div v-if="showAddButton" class="absolute bottom-2 left-2">
        <n-tooltip placement="top">
          <template #trigger>
            <n-button quaternary size="small" @click.stop="duplicate?.(props.nodeKey)">
              <template #icon><span class="i-lucide-plus h-4 w-4"></span></template>
            </n-button>
          </template>
          {{ t('builder.listAdd') }}
        </n-tooltip>
      </div>
    </div>
  </div>
</template>
