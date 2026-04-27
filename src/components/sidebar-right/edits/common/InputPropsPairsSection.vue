<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NInput } from 'naive-ui'
import { useFormBuilderI18n } from '../../../../i18n/context'
import { useFormField } from '../../../../composables/form-fields'
import EditsLayout from './EditsLayout.vue'

type PairRow = { key: string; value: string }

const { createPropsProp } = useFormField()
const { t } = useFormBuilderI18n()

const inputProps = createPropsProp<Record<string, unknown> | undefined>('inputProps', undefined)

const rows = ref<PairRow[]>([])

const toRows = (obj: Record<string, unknown> | undefined): PairRow[] => {
  if (!obj || typeof obj !== 'object') return [{ key: '', value: '' }]
  const entries = Object.entries(obj)
  if (entries.length === 0) return [{ key: '', value: '' }]
  return entries.map(([k, v]) => ({ key: k, value: typeof v === 'string' ? v : JSON.stringify(v) }))
}

const parseValue = (raw: string): unknown => {
  const v = raw.trim()
  if (v === '') return ''
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v)
  try {
    return JSON.parse(v)
  } catch {
    return v
  }
}

const commit = () => {
  const obj: Record<string, unknown> = {}
  for (const r of rows.value) {
    const k = r.key.trim()
    if (!k) continue
    obj[k] = parseValue(r.value)
  }
  inputProps.value = Object.keys(obj).length ? obj : undefined
}

watch(
  () => inputProps.value,
  (next) => {
    rows.value = toRows(next)
  },
  { immediate: true, deep: true },
)

const addRow = () => {
  rows.value = [...rows.value, { key: '', value: '' }]
}

const removeRow = (index: number) => {
  const next = rows.value.filter((_, i) => i !== index)
  rows.value = next.length ? next : [{ key: '', value: '' }]
  commit()
}

const label = computed(() => t('edits.inputProps.label'))
</script>

<template>
  <EditsLayout>
    <label class="text-xs font-medium tracking-wide text-foreground/80 block mb-1">{{ label }}</label>
    <div class="flex flex-col gap-2">
      <div v-for="(r, idx) in rows" :key="idx" class="flex flex-row gap-2 items-center">
        <n-input
          size="small"
          class="flex-1"
          :placeholder="t('edits.inputProps.keyPlaceholder')"
          :value="r.key"
          @update:value="(v) => { rows[idx] = { ...r, key: v }; commit() }"
        />
        <n-input
          size="small"
          class="flex-1"
          :placeholder="t('edits.inputProps.valuePlaceholder')"
          :value="r.value"
          @update:value="(v) => { rows[idx] = { ...r, value: v }; commit() }"
        />
        <n-button quaternary size="small" @click="removeRow(idx)" class="!px-2">
          <span class="i-lucide-trash-2 h-4 w-4"></span>
        </n-button>
      </div>
      <n-button size="small" secondary @click="addRow">
        {{ t('edits.inputProps.add') }}
      </n-button>
    </div>
  </EditsLayout>
</template>

