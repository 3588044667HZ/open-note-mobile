import { createRouter, createWebHashHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import MainLayout from '../views/MainLayout.vue'
import TrashPage from '../views/TrashPage.vue'
import SettingsPage from '../views/SettingsPage.vue'

const routes = [
  { path: '/', name: 'login', component: LoginPage },
  {
    path: '/home',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: () => import('../views/NoteListPage.vue') },
    ],
  },
  { path: '/edit/:id?', name: 'editor', component: () => import('../views/NoteEditorPage.vue'), props: true },
  { path: '/trash', name: 'trash', component: TrashPage },
  { path: '/settings', name: 'settings', component: SettingsPage },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/') {
    return '/'
  }
})

export default router
