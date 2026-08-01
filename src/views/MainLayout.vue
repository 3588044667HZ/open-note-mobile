<template>
  <div class="page main-layout" :style="{ backgroundColor: skinCloth }">
    <div class="layout-body">
      <router-view />
    </div>

    <nav class="tab-bar">
      <button class="tab-item" @click="router.replace('/home')">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="2.5" width="16" height="17" rx="2" :stroke="isActive('/home') ? 'var(--color-primary)' : 'rgba(0,0,0,0.35)'" stroke-width="1.5"/>
          <line x1="7" y1="7" x2="15" y2="7" :stroke="isActive('/home') ? 'var(--color-primary)' : 'rgba(0,0,0,0.35)'" stroke-width="1.3" stroke-linecap="round"/>
          <line x1="7" y1="11" x2="15" y2="11" :stroke="isActive('/home') ? 'var(--color-primary)' : 'rgba(0,0,0,0.35)'" stroke-width="1.3" stroke-linecap="round"/>
          <line x1="7" y1="15" x2="11" y2="15" :stroke="isActive('/home') ? 'var(--color-primary)' : 'rgba(0,0,0,0.35)'" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <span>Notes</span>
      </button>
      <button class="tab-item" @click="router.push({ name: 'editor' })">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="8" :stroke="'rgba(0,0,0,0.35)'" stroke-width="1.5"/>
          <line x1="11" y1="7" x2="11" y2="15" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="7" y1="11" x2="15" y2="11" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>New</span>
      </button>
      <button class="tab-item" @click="router.push('/trash')">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M5.5 6.5h11M8 6.5v-1a1 1 0 011-1h4a1 1 0 011 1v1" :stroke="isActive('/trash') ? 'var(--color-primary)' : 'rgba(0,0,0,0.35)'" stroke-width="1.5" stroke-linecap="round"/>
          <rect x="6" y="6.5" width="10" height="10" rx="1.5" :stroke="isActive('/trash') ? 'var(--color-primary)' : 'rgba(0,0,0,0.35)'" stroke-width="1.5"/>
        </svg>
        <span>Trash</span>
      </button>
      <button class="tab-item" @click="router.push('/settings')">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="3.5" :stroke="isActive('/settings') ? 'var(--color-primary)' : 'rgba(0,0,0,0.35)'" stroke-width="1.5"/>
          <path d="M11 3.5v2M11 16.5v2M3.5 11h2M16.5 11h2M5.7 5.7l1.4 1.4M14.9 14.9l1.4 1.4M5.7 16.3l1.4-1.4M14.9 7.1l1.4-1.4" :stroke="isActive('/settings') ? 'var(--color-primary)' : 'rgba(0,0,0,0.35)'" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Settings</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSkin } from '../composables/useSkin'

const router = useRouter()
const route = useRoute()
const { currentSkin, SKINS } = useSkin()

const skinCloth = computed(() => SKINS[currentSkin.value] || '#FAFAFA')

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.main-layout {
  background: var(--skin-backcloth);
  transition: background-color 0.4s ease;
}

.layout-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc(var(--tabbar-height) + var(--safe-area-bottom));
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--tabbar-height);
  background: var(--color-white);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: var(--safe-area-bottom);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 60px;
  height: var(--tabbar-height);
  font-size: 10px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.35);
  transition: color 0.2s;
}

.tab-item:nth-child(2) span {
  color: var(--color-primary);
}
</style>
