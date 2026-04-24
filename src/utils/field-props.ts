export { defaultFormElements, createDefaultFormElements } from './default-form-elements'

export type { FormKitSchemaFormKit } from '@formkit/core'

export type FieldCategory = 'fields' | 'structure' | 'static'

type FieldPropDef = {
  name: string
  tooltipKey: string
  icon: string
  category: FieldCategory
}

export type FieldProp = {
  name: string
  tooltip: string
  icon: string
  category: FieldCategory
}

const defs: FieldPropDef[] = [
  {
    name: 'text',
    tooltipKey: 'fieldProps.tooltip.text',
    icon: 'i-lucide-type',
    category: 'fields',
  },
  {
    name: 'email',
    tooltipKey: 'fieldProps.tooltip.email',
    icon: 'i-lucide-mail',
    category: 'fields',
  },
  {
    name: 'color',
    tooltipKey: 'fieldProps.tooltip.color',
    icon: 'i-lucide-pipette',
    category: 'fields',
  },
  {
    name: 'number',
    tooltipKey: 'fieldProps.tooltip.number',
    icon: 'i-lucide-hash',
    category: 'fields',
  },
  {
    name: 'checkbox',
    tooltipKey: 'fieldProps.tooltip.checkbox',
    icon: 'i-lucide-square-check',
    category: 'fields',
  },
  {
    name: 'date',
    tooltipKey: 'fieldProps.tooltip.date',
    icon: 'i-lucide-calendar',
    category: 'fields',
  },
  {
    name: 'naiveDateTime',
    tooltipKey: 'fieldProps.tooltip.dateTime',
    icon: 'i-lucide-calendar-clock',
    category: 'fields',
  },
  {
    name: 'file',
    tooltipKey: 'fieldProps.tooltip.file',
    icon: 'i-lucide-paperclip',
    category: 'fields',
  },
  {
    name: 'password',
    tooltipKey: 'fieldProps.tooltip.password',
    icon: 'i-lucide-lock',
    category: 'fields',
  },
  {
    name: 'radio',
    tooltipKey: 'fieldProps.tooltip.radio',
    icon: 'i-lucide-circle-dot',
    category: 'fields',
  },
  {
    name: 'range',
    tooltipKey: 'fieldProps.tooltip.range',
    icon: 'i-lucide-sliders-horizontal',
    category: 'fields',
  },
  {
    name: 'select',
    tooltipKey: 'fieldProps.tooltip.select',
    icon: 'i-lucide-list',
    category: 'fields',
  },
  {
    name: 'naiveCascader',
    tooltipKey: 'fieldProps.tooltip.naiveCascader',
    icon: 'i-lucide-list',
    category: 'fields',
  },
  {
    name: 'naiveTreeSelect',
    tooltipKey: 'fieldProps.tooltip.naiveTreeSelect',
    icon: 'i-lucide-list-tree',
    category: 'fields',
  },
  {
    name: 'naiveMention',
    tooltipKey: 'fieldProps.tooltip.naiveMention',
    icon: 'i-lucide-letter-text',
    category: 'fields',
  },
  {
    name: 'naiveRate',
    tooltipKey: 'fieldProps.tooltip.naiveRate',
    icon: 'i-lucide-sliders-horizontal',
    category: 'fields',
  },
  {
    name: 'naiveSwitch',
    tooltipKey: 'fieldProps.tooltip.naiveSwitch',
    icon: 'i-lucide-square-check',
    category: 'fields',
  },
  {
    name: 'naiveCheckbox',
    tooltipKey: 'fieldProps.tooltip.naiveCheckbox',
    icon: 'i-lucide-square-check',
    category: 'fields',
  },
  {
    name: 'naiveAvatar',
    tooltipKey: 'fieldProps.tooltip.naiveAvatar',
    icon: 'i-stash:user-avatar',
    category: 'fields',
  },
  {
    name: 'naiveImage',
    tooltipKey: 'fieldProps.tooltip.naiveImage',
    icon: 'i-lucide-image',
    category: 'fields',
  },
  {
    name: 'tel',
    tooltipKey: 'fieldProps.tooltip.tel',
    icon: 'i-lucide-phone',
    category: 'fields',
  },
  {
    name: 'textarea',
    tooltipKey: 'fieldProps.tooltip.textarea',
    icon: 'i-lucide-letter-text',
    category: 'fields',
  },
  {
    name: 'time',
    tooltipKey: 'fieldProps.tooltip.time',
    icon: 'i-lucide-clock',
    category: 'fields',
  },
  {
    name: 'url',
    tooltipKey: 'fieldProps.tooltip.url',
    icon: 'i-lucide-link-2',
    category: 'fields',
  },
  {
    name: 'submit',
    tooltipKey: 'fieldProps.tooltip.submit',
    icon: 'i-lucide-send-horizontal',
    category: 'static',
  },
  {
    name: 'naiveButton',
    tooltipKey: 'fieldProps.tooltip.naiveButton',
    icon: 'i-lucide-square-mouse-pointer',
    category: 'static',
  },
  {
    name: 'naiveText',
    tooltipKey: 'fieldProps.tooltip.naiveText',
    icon: 'i-lucide-letter-text',
    category: 'static',
  },
  {
    name: 'naiveP',
    tooltipKey: 'fieldProps.tooltip.naiveP',
    icon: 'i-lucide-letter-text',
    category: 'static',
  },
  {
    name: 'naiveA',
    tooltipKey: 'fieldProps.tooltip.naiveA',
    icon: 'i-lucide-link-2',
    category: 'static',
  },
  {
    name: 'naiveBlockquote',
    tooltipKey: 'fieldProps.tooltip.naiveBlockquote',
    icon: 'i-lucide-letter-text',
    category: 'static',
  },
  {
    name: 'naiveHr',
    tooltipKey: 'fieldProps.tooltip.naiveHr',
    icon: 'i-lucide-sliders-horizontal',
    category: 'static',
  },
  {
    name: 'naiveH1',
    tooltipKey: 'fieldProps.tooltip.naiveH1',
    icon: 'i-lucide-heading-1',
    category: 'static',
  },
  {
    name: 'naiveH2',
    tooltipKey: 'fieldProps.tooltip.naiveH2',
    icon: 'i-lucide-heading-2',
    category: 'static',
  },
  {
    name: 'naiveH3',
    tooltipKey: 'fieldProps.tooltip.naiveH3',
    icon: 'i-lucide-heading-3',
    category: 'static',
  },
  {
    name: 'naiveH4',
    tooltipKey: 'fieldProps.tooltip.naiveH4',
    icon: 'i-lucide-heading-4',
    category: 'static',
  },
  {
    name: 'naiveH5',
    tooltipKey: 'fieldProps.tooltip.naiveH5',
    icon: 'i-lucide-heading-5',
    category: 'static',
  },
  {
    name: 'naiveH6',
    tooltipKey: 'fieldProps.tooltip.naiveH6',
    icon: 'i-lucide-heading-6',
    category: 'static',
  },
  {
    name: 'naiveUl',
    tooltipKey: 'fieldProps.tooltip.naiveUl',
    icon: 'i-lucide-list',
    category: 'static',
  },
  {
    name: 'naiveOl',
    tooltipKey: 'fieldProps.tooltip.naiveOl',
    icon: 'i-lucide-list',
    category: 'static',
  },
  {
    name: 'naiveLi',
    tooltipKey: 'fieldProps.tooltip.naiveLi',
    icon: 'i-lucide-list',
    category: 'static',
  },
  {
    name: 'naiveDivider',
    tooltipKey: 'fieldProps.tooltip.naiveDivider',
    icon: 'i-lucide-sliders-horizontal',
    category: 'static',
  },
  {
    name: 'group',
    tooltipKey: 'fieldProps.tooltip.group',
    icon: 'i-lucide-group',
    category: 'structure',
  },
  {
    name: 'list',
    tooltipKey: 'fieldProps.tooltip.list',
    icon: 'i-lucide-list-tree',
    category: 'structure',
  },
]

export function createFieldProps(t: (key: string) => string): FieldProp[] {
  return defs.map((d) => ({
    name: d.name,
    tooltip: t(d.tooltipKey),
    icon: d.icon,
    category: d.category,
  }))
}

export const fieldProps = createFieldProps((v) => v)
