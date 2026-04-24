<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { NConfigProvider, NLayout, darkTheme, dateEnUS, dateZhCN, enUS, zhCN, type ConfigProviderProps } from 'naive-ui'
import { useColorMode, usePreferredDark } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import SidebarLeft from '../components/sidebar-left/SidebarLeft.vue'
import SidebarRight from '../components/sidebar-right/SidebarRight.vue'
import BuilderDropArea from './BuilderDropArea.vue'
import BuilderHeader from './BuilderHeader.vue'
import { useFormBuilderConfig } from '../composables/use-config'
import type { FormBuilderConfig } from '../types/env'

const props = defineProps<ConfigProviderProps>()

const colorMode = useColorMode()
const preferredDark = usePreferredDark()
const resolvedIsDark = computed(() => colorMode.value === 'dark' || (colorMode.value === 'auto' && preferredDark.value))
const activeTheme = computed(() => {
  if (props.theme !== undefined) return props.theme
  return resolvedIsDark.value ? darkTheme : null
})

const cfg = useFormBuilderConfig() as FormBuilderConfig

const { locale, mergeLocaleMessage } = useI18n()

watchEffect(() => {
  locale.value = cfg?.locale === 'en' ? 'en' : 'zh-CN'
  const extra = cfg?.messages
  if (!extra || typeof extra !== 'object') return
  for (const [loc, message] of Object.entries(extra)) {
    if (message && typeof message === 'object') mergeLocaleMessage(loc, message)
  }
})

const naiveLocale = computed(() => (locale.value === 'zh-CN' ? zhCN : enUS))
const naiveDateLocale = computed(() => (locale.value === 'zh-CN' ? dateZhCN : dateEnUS))
</script>

<template>
  <n-config-provider
    :theme="activeTheme"
    :theme-overrides="themeOverrides"
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    :breakpoints="breakpoints"
    :cls-prefix="clsPrefix"
    :abstract="abstract"
    :inline-theme-disabled="inlineThemeDisabled"
    :preflight-style-disabled="preflightStyleDisabled"
  >
    <n-layout has-sider class="h-screen w-full">
      <SidebarLeft />
      <n-layout has-sider sider-placement="right" class="flex-1">
        <n-layout class="relative" :native-scrollbar="false">
          <div class="p-4 h-full flex flex-col">
            <BuilderHeader />
            <BuilderDropArea />
          </div>
        </n-layout>
        <SidebarRight />
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>
