<script setup lang="ts">
import type { FormKitSchemaFormKit } from '@formkit/core'
import { inject, computed } from 'vue'
import { FormKitSchema } from '@formkit/vue'
import { NButton, NButtonGroup, NTooltip } from 'naive-ui'
import { useFormBuilderI18n } from '../../../i18n/context'

const props = defineProps<{
  nodeKey: string
  children: FormKitSchemaFormKit[]
}>()

const duplicate = inject(
  'previewListDuplicate',
  null as unknown as ((key: string) => void) | null,
)
const remove = inject(
  'previewListRemove',
  null as unknown as ((key: string) => void) | null,
)

const { t } = useFormBuilderI18n()

const modelValue = computed(() => (Array.isArray(props.children) ? props.children : []))
</script>

<template>
  <div class="w-full rounded-xl border border-border/50 bg-card/50">
    <div class="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <div class="text-xs text-muted-foreground">{{ t('builder.listContainer') }}</div>
      <n-button-group class="shrink-0">
        <n-tooltip placement="top">
          <template #trigger>
            <n-button quaternary size="small" @click.stop="duplicate?.(props.nodeKey)">
              <template #icon><span class="i-lucide-plus h-4 w-4"></span></template>
            </n-button>
          </template>
          {{ t('builder.listAdd') }}
        </n-tooltip>
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

    <div class="p-2">
      <div
        class="w-full grid grid-cols-12 gap-x-4 gap-y-2"
        :class="modelValue.length === 0 ? 'min-h-[140px] border-2 border-dashed border-border/50 bg-muted/20 rounded-lg p-2' : ''"
      >
        <FormKitSchema v-if="modelValue.length" :schema="modelValue" />
      </div>
    </div>
  </div>
</template>
