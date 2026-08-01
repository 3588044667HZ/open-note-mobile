<template>
  <div class="page login-page">
    <div class="login-content">
      <div class="login-logo">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <rect x="5" y="4" width="22" height="24" rx="3" fill="currentColor" opacity="0.15"/>
          <rect x="6.5" y="5.5" width="19" height="21" rx="2" stroke="currentColor" stroke-width="2"/>
          <line x1="11" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="11" y1="17" x2="21" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="11" y1="22" x2="16" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <h1>OPEN Notes</h1>
      </div>
      <p class="login-subtitle">{{ isRegister ? 'Create your account' : 'Sign in to continue' }}</p>

      <div v-if="authStore.error" class="login-error">{{ authStore.error }}</div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="input-group">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6.5" r="3" stroke="rgba(0,0,0,0.3)" stroke-width="1.3"/>
            <path d="M3.5 15.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="rgba(0,0,0,0.3)" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <input v-model="form.username" type="text" placeholder="Username" autocomplete="username" required />
        </div>
        <div class="input-group">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3.5" y="7" width="11" height="8" rx="1.5" stroke="rgba(0,0,0,0.3)" stroke-width="1.3"/>
            <path d="M5.5 7V5.5a3.5 3.5 0 117 0V7" stroke="rgba(0,0,0,0.3)" stroke-width="1.3"/>
          </svg>
          <input v-model="form.password" type="password" placeholder="Password" autocomplete="current-password" required />
        </div>
        <button type="submit" class="submit-btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'Please wait...' : (isRegister ? 'Register' : 'Sign In') }}
        </button>
      </form>

      <p class="login-toggle">
        {{ isRegister ? 'Already have an account?' : "Don't have an account?" }}
        <a href="#" @click.prevent="isRegister = !isRegister; authStore.error = ''">
          {{ isRegister ? 'Sign in' : 'Register' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNoteStore } from '../stores/note'

const router = useRouter()
const authStore = useAuthStore()
const noteStore = useNoteStore()
const isRegister = ref(false)

const form = reactive({
  username: '',
  password: '',
})

async function handleSubmit() {
  let ok
  if (isRegister.value) {
    ok = await authStore.register(form.username, form.password)
    if (ok) ok = await authStore.login(form.username, form.password)
  } else {
    ok = await authStore.login(form.username, form.password)
  }
  if (ok) {
    await Promise.all([
      noteStore.fetchNotebooks(),
      noteStore.fetchNotes(),
    ])
    router.replace('/home')
  }
}
</script>

<style scoped>
.login-page {
  background: var(--color-white);
  justify-content: center;
}

.login-content {
  padding: 0 32px;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
  color: var(--color-primary);
}

.login-logo h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
}

.login-subtitle {
  text-align: center;
  font-size: 15px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.login-error {
  background: rgba(224, 80, 80, 0.08);
  color: var(--color-danger);
  font-size: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  flex-shrink: 0;
  pointer-events: none;
}

.input-group input {
  width: 100%;
  height: 48px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0 14px 0 42px;
  font-size: 16px;
  background: var(--color-card);
  color: var(--color-text);
}

.input-group input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 106, 255, 0.1);
}

.input-group input::placeholder {
  color: var(--color-text-tertiary);
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  background: var(--color-primary);
  color: #fff;
  margin-top: 4px;
}

.submit-btn:active:not(:disabled) {
  opacity: 0.8;
}

.submit-btn:disabled {
  opacity: 0.6;
}

.login-toggle {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.login-toggle a {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
