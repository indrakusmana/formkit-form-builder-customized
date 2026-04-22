<script setup lang="ts">
import type { FormKitSchemaFormKit } from '@formkit/core'
import { inject, computed } from 'vue'
import ListContainer from './ListContainer.vue'

const props = defineProps<{
  nodeKey: string
  children: FormKitSchemaFormKit[]
}>()

const updateChildren = inject(
  'previewListUpdateChildren',
  null as unknown as ((key: string, children: FormKitSchemaFormKit[]) => void) | null,
)
const duplicate = inject(
  'previewListDuplicate',
  null as unknown as ((key: string) => void) | null,
)
const remove = inject(
  'previewListRemove',
  null as unknown as ((key: string) => void) | null,
)

const modelValue = computed(() => (Array.isArray(props.children) ? props.children : []))
</script>

<template>
  <ListContainer
    :model-value="modelValue"
    :show-actions="true"
    @update:model-value="(v) => updateChildren?.(props.nodeKey, v)"
    @duplicate="() => duplicate?.(props.nodeKey)"
    @remove="() => remove?.(props.nodeKey)"
  />
</template>
