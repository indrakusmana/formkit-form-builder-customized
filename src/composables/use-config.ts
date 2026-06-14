import { inject, provide, type InjectionKey } from 'vue'
import {
  DEFAULT_ENABLED_FIELDS,
  DEFAULT_ENABLED_VALIDATIONS,
  DEFAULT_THEME_MODE,
  type FormBuilderConfig,
} from '../types/env'

export const CONFIG_KEY: InjectionKey<FormBuilderConfig> = Symbol('configKey')

export const DEFAULT_FORM_BUILDER_CONFIG: FormBuilderConfig = {
  aiAssistant: false,
  canvasViewControls: false,
  enabledFields: DEFAULT_ENABLED_FIELDS,
  enabledValidations: DEFAULT_ENABLED_VALIDATIONS,
  locale: 'en',
  themeMode: DEFAULT_THEME_MODE,
  themeSwitcher: false,
}

export function resolveFormBuilderConfig(config?: FormBuilderConfig): FormBuilderConfig {
  return {
    ...DEFAULT_FORM_BUILDER_CONFIG,
    ...(config ?? {}),
  }
}

export function provideFormBuilderConfig(config?: FormBuilderConfig) {
  provide(CONFIG_KEY, resolveFormBuilderConfig(config))
}

export function useFormBuilderConfig() {
  return inject(CONFIG_KEY, DEFAULT_FORM_BUILDER_CONFIG)
}
