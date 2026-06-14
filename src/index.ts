import FormBuilder from './builder/BuilderMain.vue'
import BuilderPreview from './builder/BuilderPreview.vue'
import BuilderProvider from './builder/BuilderProvider.vue'
import FormSchemaRenderer from './renderer/FormSchemaRenderer.vue'

export {
  DEFAULT_FORM_BUILDER_CONFIG,
  resolveFormBuilderConfig,
  useFormBuilderConfig,
  provideFormBuilderConfig,
} from './composables/use-config'
export {
  AVAILABLE_BUILDER_FIELDS,
  AVAILABLE_THEME_MODES,
  AVAILABLE_VALIDATION_RULES,
  DEFAULT_ENABLED_FIELDS,
  DEFAULT_ENABLED_VALIDATIONS,
  DEFAULT_THEME_MODE,
} from './types/env'
export type {
  FormBuilderConfig,
  FormBuilderFieldName,
  FormBuilderThemeMode,
  FormBuilderValidationName,
} from './types/env'

export { FormBuilder, BuilderProvider }
export { BuilderPreview, FormSchemaRenderer }
export { FormBuilder as FormKitFormBuilder }
export { BuilderProvider as FormBuilderProvider }
