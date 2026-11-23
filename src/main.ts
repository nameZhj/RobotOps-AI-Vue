import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/tokens.css'
import '@/styles/global.css'
import '@/styles/controls.css'
import '@/styles/responsive.css'
import App from '@/app/App.vue'
import { router } from '@/app/router'
import { useAuthStore } from '@/modules/auth/store'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
window.addEventListener('robotops:session-expired', () => {
  useAuthStore(pinia).clearSession()
  void router.replace('/login')
})
app.use(router).use(ElementPlus).mount('#app')
