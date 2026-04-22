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
      <div class="flex items-center w-fit gap-2 rounded-lg backdrop-blur-2xl">
        <div class="h-8 w-8 rounded-md bg-ring/20 p-1.5 flex items-center justify-center">
          <span
            :class="`${fieldProps.find((prop) => prop.name === currentFieldType)?.icon ?? ''} h-5 w-5 text-green-700 dark:text-white/70`"
          ></span>
        </div>
      </div>
    </div>
    <n-scrollbar class="flex-1 sidebar-scrollbar">
      <FormEditMain />
    </n-scrollbar>
  </n-layout-sider>
</template>
