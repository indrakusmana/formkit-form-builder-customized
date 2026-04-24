import { createApp } from 'vue'
import { plugin } from '@formkit/vue'
import App from './App.vue'
import config from '../../src/formkit.config.ts'
import i18n from '../../src/i18n/i18n'
import 'uno.css'
import './style.css'

createApp(App).use(plugin, config).use(i18n).mount('#app')
