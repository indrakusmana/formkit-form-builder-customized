import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export { defaultFormElements, createDefaultFormElements } from './default-form-elements'

export type { FormKitSchemaFormKit } from '@formkit/core'

export type FieldCategory = 'fields' | 'structure' | 'static'

type FieldPropDef = {
  name: string
  tooltipKey: string
  icon: string
  category: FieldCategory
  editor?: () => Promise<{ default: Component }>
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
    editor: () => import('@/components/sidebar-right/edits/editors/TextLikeEditor.vue'),
  },
  {
    name: 'email',
    tooltipKey: 'fieldProps.tooltip.email',
    icon: 'i-lucide-mail',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/TextLikeEditor.vue'),
  },
  {
    name: 'color',
    tooltipKey: 'fieldProps.tooltip.color',
    icon: 'i-lucide-pipette',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/ColorEditor.vue'),
  },
  {
    name: 'number',
    tooltipKey: 'fieldProps.tooltip.number',
    icon: 'i-lucide-hash',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/NumberEditor.vue'),
  },
  {
    name: 'checkbox',
    tooltipKey: 'fieldProps.tooltip.checkbox',
    icon: 'i-lucide-square-check',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/CheckboxEditor.vue'),
  },
  {
    name: 'date',
    tooltipKey: 'fieldProps.tooltip.date',
    icon: 'i-lucide-calendar',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/DateLikeEditor.vue'),
  },
  {
    name: 'naiveDateTime',
    tooltipKey: 'fieldProps.tooltip.dateTime',
    icon: 'i-lucide-calendar-clock',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/DateTimeEditor.vue'),
  },
  {
    name: 'file',
    tooltipKey: 'fieldProps.tooltip.file',
    icon: 'i-lucide-paperclip',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/FileEditor.vue'),
  },
  {
    name: 'password',
    tooltipKey: 'fieldProps.tooltip.password',
    icon: 'i-lucide-lock',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/TextLikeEditor.vue'),
  },
  {
    name: 'radio',
    tooltipKey: 'fieldProps.tooltip.radio',
    icon: 'i-lucide-circle-dot',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/RadioEditor.vue'),
  },
  {
    name: 'range',
    tooltipKey: 'fieldProps.tooltip.range',
    icon: 'i-lucide-sliders-horizontal',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/RangeEditor.vue'),
  },
  {
    name: 'select',
    tooltipKey: 'fieldProps.tooltip.select',
    icon: 'i-lucide-list',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/SelectEditor.vue'),
  },
  {
    name: 'naiveCascader',
    tooltipKey: 'fieldProps.tooltip.naiveCascader',
    icon: 'i-lucide-list',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveCascaderEditor.vue'),
  },
  {
    name: 'naiveTreeSelect',
    tooltipKey: 'fieldProps.tooltip.naiveTreeSelect',
    icon: 'i-lucide-list-tree',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveTreeSelectEditor.vue'),
  },
  {
    name: 'naiveMention',
    tooltipKey: 'fieldProps.tooltip.naiveMention',
    icon: 'i-lucide-letter-text',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveMentionEditor.vue'),
  },
  {
    name: 'naiveRate',
    tooltipKey: 'fieldProps.tooltip.naiveRate',
    icon: 'i-lucide-sliders-horizontal',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveRateEditor.vue'),
  },
  {
    name: 'naiveSwitch',
    tooltipKey: 'fieldProps.tooltip.naiveSwitch',
    icon: 'i-lucide-square-check',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveSwitchEditor.vue'),
  },
  {
    name: 'naiveCheckbox',
    tooltipKey: 'fieldProps.tooltip.naiveCheckbox',
    icon: 'i-lucide-square-check',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveCheckboxEditor.vue'),
  },
  {
    name: 'naiveAvatar',
    tooltipKey: 'fieldProps.tooltip.naiveAvatar',
    icon: 'i-stash:user-avatar',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveAvatarEditor.vue'),
  },
  {
    name: 'naiveImage',
    tooltipKey: 'fieldProps.tooltip.naiveImage',
    icon: 'i-lucide-image',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveImageEditor.vue'),
  },
  {
    name: 'tel',
    tooltipKey: 'fieldProps.tooltip.tel',
    icon: 'i-lucide-phone',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/TextLikeEditor.vue'),
  },
  {
    name: 'textarea',
    tooltipKey: 'fieldProps.tooltip.textarea',
    icon: 'i-lucide-letter-text',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/TextLikeEditor.vue'),
  },
  {
    name: 'time',
    tooltipKey: 'fieldProps.tooltip.time',
    icon: 'i-lucide-clock',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/DateLikeEditor.vue'),
  },
  {
    name: 'url',
    tooltipKey: 'fieldProps.tooltip.url',
    icon: 'i-lucide-link-2',
    category: 'fields',
    editor: () => import('@/components/sidebar-right/edits/editors/TextLikeEditor.vue'),
  },
  {
    name: 'submit',
    tooltipKey: 'fieldProps.tooltip.submit',
    icon: 'i-lucide-send-horizontal',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/SubmitEditor.vue'),
  },
  {
    name: 'naiveButton',
    tooltipKey: 'fieldProps.tooltip.naiveButton',
    icon: 'i-lucide-square-mouse-pointer',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveButtonEditor.vue'),
  },
  {
    name: 'naiveText',
    tooltipKey: 'fieldProps.tooltip.naiveText',
    icon: 'i-lucide-letter-text',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveTextEditor.vue'),
  },
  {
    name: 'naiveP',
    tooltipKey: 'fieldProps.tooltip.naiveP',
    icon: 'i-lucide-letter-text',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveParagraphEditor.vue'),
  },
  {
    name: 'naiveA',
    tooltipKey: 'fieldProps.tooltip.naiveA',
    icon: 'i-lucide-link-2',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveLinkEditor.vue'),
  },
  {
    name: 'naiveBlockquote',
    tooltipKey: 'fieldProps.tooltip.naiveBlockquote',
    icon: 'i-lucide-letter-text',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveBlockquoteEditor.vue'),
  },
  {
    name: 'naiveH1',
    tooltipKey: 'fieldProps.tooltip.naiveH1',
    icon: 'i-lucide-heading-1',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveH1Editor.vue'),
  },
  {
    name: 'naiveH2',
    tooltipKey: 'fieldProps.tooltip.naiveH2',
    icon: 'i-lucide-heading-2',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveH2Editor.vue'),
  },
  {
    name: 'naiveH3',
    tooltipKey: 'fieldProps.tooltip.naiveH3',
    icon: 'i-lucide-heading-3',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveH3Editor.vue'),
  },
  {
    name: 'naiveH4',
    tooltipKey: 'fieldProps.tooltip.naiveH4',
    icon: 'i-lucide-heading-4',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveH4Editor.vue'),
  },
  {
    name: 'naiveH5',
    tooltipKey: 'fieldProps.tooltip.naiveH5',
    icon: 'i-lucide-heading-5',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveH5Editor.vue'),
  },
  {
    name: 'naiveH6',
    tooltipKey: 'fieldProps.tooltip.naiveH6',
    icon: 'i-lucide-heading-6',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveH6Editor.vue'),
  },
  {
    name: 'naiveUl',
    tooltipKey: 'fieldProps.tooltip.naiveUl',
    icon: 'i-lucide-list',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveUlEditor.vue'),
  },
  {
    name: 'naiveOl',
    tooltipKey: 'fieldProps.tooltip.naiveOl',
    icon: 'i-lucide-list',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveOlEditor.vue'),
  },
  {
    name: 'naiveLi',
    tooltipKey: 'fieldProps.tooltip.naiveLi',
    icon: 'i-lucide-list',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveLiEditor.vue'),
  },
  {
    name: 'naiveDivider',
    tooltipKey: 'fieldProps.tooltip.naiveDivider',
    icon: 'i-lucide-sliders-horizontal',
    category: 'static',
    editor: () => import('@/components/sidebar-right/edits/editors/NaiveDividerEditor.vue'),
  },
  {
    name: 'group',
    tooltipKey: 'fieldProps.tooltip.group',
    icon: 'i-lucide-group',
    category: 'structure',
    editor: () => import('@/components/sidebar-right/edits/editors/GroupEditor.vue'),
  },
  {
    name: 'list',
    tooltipKey: 'fieldProps.tooltip.list',
    icon: 'i-lucide-list-tree',
    category: 'structure',
    editor: () => import('@/components/sidebar-right/edits/editors/GroupEditor.vue'),
  },
  {
    name: 'card',
    tooltipKey: 'fieldProps.tooltip.card',
    icon: 'i-lucide-credit-card',
    category: 'structure',
    editor: () => import('@/components/sidebar-right/edits/editors/CardEditor.vue'),
  },
]

const editorCache = new Map<string, Component>()

export function getFieldEditorComponent(type: string | null | undefined): Component | null {
  if (!type) return null
  const cached = editorCache.get(type)
  if (cached) return cached
  const def = defs.find((d) => d.name === type)
  if (!def?.editor) return null
  const component = defineAsyncComponent(def.editor)
  editorCache.set(type, component)
  return component
}

export function createFieldProps(t: (key: string) => string): FieldProp[] {
  return defs.map((d) => ({
    name: d.name,
    tooltip: t(d.tooltipKey),
    icon: d.icon,
    category: d.category,
  }))
}

export const fieldProps = createFieldProps((v) => v)
