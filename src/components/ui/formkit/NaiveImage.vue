<script setup lang="ts">
import type { FormKitFrameworkContext } from '@formkit/core'
import { NImage } from 'naive-ui'
import { computed } from 'vue'

const props = defineProps<{
  context: FormKitFrameworkContext
}>()

const naiveProps = computed<Record<string, unknown>>(() => {
  const ctx = props.context as unknown as { naiveProps?: Record<string, unknown> }
  const nodeProps = props.context.node.props as Record<string, unknown>
  return (ctx.naiveProps ?? (nodeProps.naiveProps as Record<string, unknown> | undefined) ?? {}) as Record<
    string,
    unknown
  >
})

const src = computed(() => naiveProps.value.src as string | undefined)
const alt = computed(() => naiveProps.value.alt as string | undefined)

const width = computed(() => naiveProps.value.width as any)
const height = computed(() => naiveProps.value.height as any)
const objectFit = computed(() => naiveProps.value.objectFit as any)
const previewDisabled = computed<boolean>(() => Boolean((naiveProps.value.previewDisabled as boolean | undefined) ?? false))
const lazy = computed<boolean>(() => Boolean((naiveProps.value.lazy as boolean | undefined) ?? false))
</script>

<template>
  <div class="w-full py-2">
    <NImage
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :object-fit="objectFit"
      :preview-disabled="previewDisabled"
      :lazy="lazy"
    />
  </div>
</template>
