// formkit.config.ts
import { rootClasses } from './formkit.theme.ts'
import { defaultConfig, createInput } from '@formkit/vue'
import CustomButton from './components/ui/button/CustomButton.vue'
import NaiveTextInput from './components/ui/formkit/NaiveTextInput.vue'
import NaiveTextarea from './components/ui/formkit/NaiveTextarea.vue'
import NaiveNumberInput from './components/ui/formkit/NaiveNumberInput.vue'
import NaiveSelect from './components/ui/formkit/NaiveSelect.vue'
import NaiveDatePicker from './components/ui/formkit/NaiveDatePicker.vue'
import NaiveTimePicker from './components/ui/formkit/NaiveTimePicker.vue'
import NaiveUpload from './components/ui/formkit/NaiveUpload.vue'
import NaiveCheckboxGroup from './components/ui/formkit/NaiveCheckboxGroup.vue'
import NaiveRadioGroup from './components/ui/formkit/NaiveRadioGroup.vue'
import NaiveSlider from './components/ui/formkit/NaiveSlider.vue'
import NaiveColorPicker from './components/ui/formkit/NaiveColorPicker.vue'
import NaiveAvatar from './components/ui/formkit/NaiveAvatar.vue'
import NaiveImage from './components/ui/formkit/NaiveImage.vue'
import NaiveCascader from './components/ui/formkit/NaiveCascader.vue'
import NaiveCheckbox from './components/ui/formkit/NaiveCheckbox.vue'
import NaiveMention from './components/ui/formkit/NaiveMention.vue'
import NaiveRate from './components/ui/formkit/NaiveRate.vue'
import NaiveSwitch from './components/ui/formkit/NaiveSwitch.vue'
import NaiveTreeSelect from './components/ui/formkit/NaiveTreeSelect.vue'
import NaiveTypographyText from './components/ui/formkit/NaiveTypographyText.vue'
import NaiveTypographyP from './components/ui/formkit/NaiveTypographyP.vue'
import NaiveTypographyA from './components/ui/formkit/NaiveTypographyA.vue'
import NaiveTypographyBlockquote from './components/ui/formkit/NaiveTypographyBlockquote.vue'
import NaiveTypographyHeader from './components/ui/formkit/NaiveTypographyHeader.vue'
import NaiveTypographyUl from './components/ui/formkit/NaiveTypographyUl.vue'
import NaiveTypographyOl from './components/ui/formkit/NaiveTypographyOl.vue'
import NaiveTypographyLi from './components/ui/formkit/NaiveTypographyLi.vue'
import NaiveDivider from './components/ui/formkit/NaiveDivider.vue'

const sharedObservedProps = [
  'props',
  'placeholder',
  'options',
  'min',
  'max',
  'step',
  'multiple',
  'accept',
]

function createUiInput(
  cmpName: string,
  component: unknown,
  options: { family?: string } = {},
) {
  return createInput(
    {
      $el: 'div',
      attrs: { class: 'w-full' },
      children: [
        {
          $cmp: cmpName,
          props: { context: '$node.context' },
        },
      ],
    },
    {
      family: options.family ?? 'naive',
      props: sharedObservedProps,
      library: { [cmpName]: component },
    },
  )
}

export default defaultConfig({
  config: {
    rootClasses,
  },
  inputs: {
    naiveButton: createInput(CustomButton, { family: 'naive', props: ['buttonProps', 'buttonText'] }),
    submit: createInput(CustomButton, { family: 'naive', props: ['buttonProps', 'buttonText'] }),
    text: createUiInput('NaiveTextInput', NaiveTextInput),
    email: createUiInput('NaiveTextInput', NaiveTextInput),
    password: createUiInput('NaiveTextInput', NaiveTextInput),
    tel: createUiInput('NaiveTextInput', NaiveTextInput),
    url: createUiInput('NaiveTextInput', NaiveTextInput),
    textarea: createUiInput('NaiveTextarea', NaiveTextarea),
    number: createUiInput('NaiveNumberInput', NaiveNumberInput),
    select: createUiInput('NaiveSelect', NaiveSelect),
    checkbox: createUiInput('NaiveCheckboxGroup', NaiveCheckboxGroup),
    radio: createUiInput('NaiveRadioGroup', NaiveRadioGroup),
    range: createUiInput('NaiveSlider', NaiveSlider),
    date: createUiInput('NaiveDatePicker', NaiveDatePicker),
    time: createUiInput('NaiveTimePicker', NaiveTimePicker),
    naiveDateTime: createUiInput('NaiveDatePicker', NaiveDatePicker),
    file: createUiInput('NaiveUpload', NaiveUpload),
    color: createUiInput('NaiveColorPicker', NaiveColorPicker),
    naiveAvatar: createUiInput('NaiveAvatar', NaiveAvatar),
    naiveImage: createUiInput('NaiveImage', NaiveImage),
    naiveCascader: createUiInput('NaiveCascader', NaiveCascader),
    naiveCheckbox: createUiInput('NaiveCheckbox', NaiveCheckbox),
    naiveMention: createUiInput('NaiveMention', NaiveMention),
    naiveRate: createUiInput('NaiveRate', NaiveRate),
    naiveSwitch: createUiInput('NaiveSwitch', NaiveSwitch),
    naiveTreeSelect: createUiInput('NaiveTreeSelect', NaiveTreeSelect),
    naiveText: createUiInput('NaiveTypographyText', NaiveTypographyText),
    naiveP: createUiInput('NaiveTypographyP', NaiveTypographyP),
    naiveA: createUiInput('NaiveTypographyA', NaiveTypographyA),
    naiveBlockquote: createUiInput('NaiveTypographyBlockquote', NaiveTypographyBlockquote),
    naiveH1: createUiInput('NaiveTypographyHeader', NaiveTypographyHeader),
    naiveH2: createUiInput('NaiveTypographyHeader', NaiveTypographyHeader),
    naiveH3: createUiInput('NaiveTypographyHeader', NaiveTypographyHeader),
    naiveH4: createUiInput('NaiveTypographyHeader', NaiveTypographyHeader),
    naiveH5: createUiInput('NaiveTypographyHeader', NaiveTypographyHeader),
    naiveH6: createUiInput('NaiveTypographyHeader', NaiveTypographyHeader),
    naiveUl: createUiInput('NaiveTypographyUl', NaiveTypographyUl),
    naiveOl: createUiInput('NaiveTypographyOl', NaiveTypographyOl),
    naiveLi: createUiInput('NaiveTypographyLi', NaiveTypographyLi),
    naiveDivider: createUiInput('NaiveDivider', NaiveDivider),
  },
})
