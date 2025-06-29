import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'

import { useMopidyStore } from '@/stores/mopidy'
import { MopidyService } from '@/services/mopidy'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const mopidyStore = useMopidyStore()
const mopidyService = new MopidyService(mopidyStore)
mopidyService.connect()
app.provide('mopidyService', mopidyService)

app.mount('#app')
