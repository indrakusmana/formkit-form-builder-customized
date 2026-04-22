<script setup lang="ts">
import { computed } from 'vue'
import { NLayoutSider, NScrollbar } from 'naive-ui'
import FormEditMain from './FormEditMain.vue'
import { createFieldProps } from '../../utils/field-props'
import { useFormField } from '../../composables/form-fields'
import { useFormBuilderI18n } from '../../i18n/context'

const { currentFieldType } = useFormField()
const { t } = useFormBuilderI18n()
const fieldProps = computed(() => createFieldProps(t))
const currentProp = computed(() =>
  fieldProps.value.find((prop) => prop.name === currentFieldType.value),
)
</script>

<template>
  <n-layout-sider
    bordered
    width="300"
    show-trigger="bar"
    collapse-mode="transform"
    :native-scrollbar="false"
    content-style="display: flex; flex-direction: column; height: 100%;"
    class="sidebar-sider"
  >
    <div class="p-4 border-b">
      <div class="flex flex-col items-start gap-2 rounded-lg backdrop-blur-2xl">
        <div class="h-10 w-10 rounded-md bg-ring/20 p-1.5 flex items-center justify-center">
          <span
            :class="`${currentProp?.icon ?? ''} h-7 w-7 text-green-700 dark:text-white/70`"
          ></span>
        </div>
        <span class="text-xs text-muted-foreground leading-tight">
          {{ currentProp?.tooltip ?? '' }}
        </span>
      </div>
    </div>
    <n-scrollbar class="flex-1 sidebar-scrollbar">
      <FormEditMain />
    </n-scrollbar>
  </n-layout-sider>
</template>
