import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Router configuration
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/HomeView.vue')
    }
  ]
})

// Vuetify configuration with modern neon color palette
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#0f1419',
          surface: '#1a1f2e',
          primary: '#6366f1',
          secondary: '#ec4899',
          accent: '#06b6d4',
          error: '#ff006e',
          warning: '#ff7a45',
          info: '#00d9ff',
          success: '#00ff88'
        }
      },
      light: {
        dark: false,
        colors: {
          background: '#ffffff',
          surface: '#ffffff',
          primary: '#1d4ed8',
          secondary: '#2563eb',
          accent: '#0ea5e9',
          error: '#ff006e',
          warning: '#ff7a45',
          info: '#00d9ff',
          success: '#00ff88'
        },
        variables: {
          'high-emphasis-opacity': 1,
          'medium-emphasis-opacity': 0.92,
          'disabled-opacity': 0.6
        }
      }
    }
  }
})

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')
