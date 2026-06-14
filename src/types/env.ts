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
] as const satisfies readonly FormBuilderFieldName[]

export interface FormBuilderConfig {
  apiKey?: string
  aiAssistant?: boolean
  enabledFields?: readonly FormBuilderFieldName[]
  locale?: string
  messages?: Record<string, any>
}
