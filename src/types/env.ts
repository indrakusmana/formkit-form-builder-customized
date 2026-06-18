// Available field ids for FormBuilderConfig.enabledFields:
// text, textarea, email, number, url, checkbox, color, date, time, naiveDateTime,
// file, password, radio, range, select, naiveCascader, naiveTreeSelect,
// naiveMention, naiveRate, naiveSwitch, naiveAvatar, naiveImage, tel,
// naiveButton, submit, reset, list, card, inputGroup, tabs,
// naiveText, naiveP, naiveA, naiveBlockquote, naiveH1, naiveH2, naiveH3,
// naiveH4, naiveH5, naiveH6, naiveUl, naiveOl, naiveLi, naiveDivider,
// naiveAlert, naiveBackTop.
export const AVAILABLE_BUILDER_FIELDS = [
  'text',
  'textarea',
  'email',
  'number',
  'url',
  'checkbox',
  'color',
  'date',
  'time',
  'naiveDateTime',
  'file',
  'password',
  'radio',
  'range',
  'select',
  'naiveCascader',
  'naiveTreeSelect',
  'naiveMention',
  'naiveRate',
  'naiveSwitch',
  'naiveAvatar',
  'naiveImage',
  'tel',
  'naiveButton',
  'submit',
  'reset',
  'list',
  'card',
  'inputGroup',
  'tabs',
  'naiveText',
  'naiveP',
  'naiveA',
  'naiveBlockquote',
  'naiveH1',
  'naiveH2',
  'naiveH3',
  'naiveH4',
  'naiveH5',
  'naiveH6',
  'naiveUl',
  'naiveOl',
  'naiveLi',
  'naiveDivider',
  'naiveAlert',
  'naiveBackTop',
] as const

export type FormBuilderFieldName = (typeof AVAILABLE_BUILDER_FIELDS)[number]

export const DEFAULT_ENABLED_FIELDS = [
  'text',
  'textarea',
  'number',
  'date',
  'select',
  'radio',
  'checkbox',
  'file',
  'naiveButton',
] as const satisfies readonly FormBuilderFieldName[]

// Available validation rule ids for FormBuilderConfig.enabledValidations:
// accepted, required, email, number, lowercase, uppercase, url, alpha,
// alpha_spaces, alphanumeric, symbol, contains_alpha, contains_alphanumeric,
// contains_alpha_spaces, contains_symbol, contains_uppercase, contains_lowercase,
// contains_numeric, confirm, min, max, matches, starts_with, ends_with,
// date_after, date_before, date_format, is, not, require_one, date_between,
// length, between.
export const AVAILABLE_VALIDATION_RULES = [
  'accepted',
  'required',
  'email',
  'number',
  'lowercase',
  'uppercase',
  'url',
  'alpha',
  'alpha_spaces',
  'alphanumeric',
  'symbol',
  'contains_alpha',
  'contains_alphanumeric',
  'contains_alpha_spaces',
  'contains_symbol',
  'contains_uppercase',
  'contains_lowercase',
  'contains_numeric',
  'confirm',
  'min',
  'max',
  'matches',
  'starts_with',
  'ends_with',
  'date_after',
  'date_before',
  'date_format',
  'is',
  'not',
  'require_one',
  'date_between',
  'length',
  'between',
] as const

export type FormBuilderValidationName = (typeof AVAILABLE_VALIDATION_RULES)[number]

export const DEFAULT_ENABLED_VALIDATIONS = [
  'required',
  'alpha_spaces',
  'number',
  'date_format',
  'min',
  'max',
] as const satisfies readonly FormBuilderValidationName[]

export const AVAILABLE_THEME_MODES = ['light', 'dark', 'auto'] as const

export type FormBuilderThemeMode = (typeof AVAILABLE_THEME_MODES)[number]

export const DEFAULT_THEME_MODE = 'light' as const satisfies FormBuilderThemeMode

export interface FormBuilderConfig {
  apiKey?: string
  aiAssistant?: boolean
  canvasViewControls?: boolean
  enabledFields?: readonly FormBuilderFieldName[]
  enabledValidations?: readonly FormBuilderValidationName[]
  locale?: string
  messages?: Record<string, any>
  themeMode?: FormBuilderThemeMode
  themeSwitcher?: boolean
}
