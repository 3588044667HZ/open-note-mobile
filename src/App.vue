<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useNoteStore } from './stores/note'

const router = useRouter()
const authStore = useAuthStore()
const noteStore = useNoteStore()

onMounted(async () => {
  if (authStore.isLoggedIn) {
    try {
      await authStore.fetchMe()
      await Promise.all([
        noteStore.fetchNotebooks(),
        noteStore.fetchNotes(),
      ])
      router.replace('/home')
    } catch {
      authStore.logout()
    }
  }
})
</script>
