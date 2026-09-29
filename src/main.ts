import { createApp } from 'vue'

import '@unocss/reset/tailwind.css'
import 'uno.css'
import '@/styles/index.css'

import App from './App.vue'
import router from './router'
import { pinia } from './stores'

createApp(App).use(pinia).use(router).mount('#app')
