<template>
  <div class="skin-picker-panel">
    <button
      v-for="id in visibleSkins"
      :key="id"
      class="skin-dot"
      :class="{ active: currentSkin === id }"
      :style="{ backgroundColor: SKINS[id] }"
      :title="SKIN_LABELS[id]"
      @click="$emit('select', id)"
    />
    <span class="skin-spacer"></span>
    <button
      class="dark-toggle"
      :class="{ active: currentSkin === 'black' }"
      @click="$emit('toggleDark')"
      :title="currentSkin === 'black' ? 'Light mode' : 'Dark mode'"
    >
      <svg v-if="currentSkin === 'black'" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3.5" stroke="rgba(255,255,255,0.7)" stroke-width="1.3"/>
        <path d="M8 2v1M8 13v1M2 8h1M13 8h1M3.8 3.8l.7.7M11.5 11.5l.7.7M3.8 12.2l.7-.7M11.5 4.5l.7-.7" stroke="rgba(255,255,255,0.7)" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13.5 8.5A5 5 0 017.5 2.5a5 5 0 106 6z" stroke="var(--color-icon)" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    </button>
    <button
      class="eye-toggle"
      :class="{ active: currentSkin === 'yellow' }"
      @click="$emit('toggleEye')"
      title="Eye protection mode"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" :stroke="currentSkin === 'yellow' ? '#96826C' : 'var(--color-icon)'" stroke-width="1.3"/>
        <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" :stroke="currentSkin === 'yellow' ? '#96826C' : 'var(--color-icon)'" stroke-width="1.3"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SKIN_ORDER, SKIN_LABELS, SKINS, useSkin } from '../composables/useSkin'

defineEmits(['select', 'toggleEye', 'toggleDark'])

const { currentSkin } = useSkin()

const visibleSkins = computed(() => SKIN_ORDER.filter(id => id !== 'black'))
</script>

<style scoped>
.skin-spacer {
  width: 1px;
  height: 16px;
  background: var(--type-toolbar-divider);
  margin: 0 4px;
}

.eye-toggle,
.dark-toggle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.eye-toggle:active,
.dark-toggle:active {
  background: rgba(0,0,0,0.06);
}

.eye-toggle.active {
  background: rgba(254, 247, 226, 0.5);
}

.dark-toggle.active {
  background: rgba(255, 255, 255, 0.1);
}

@media (prefers-color-scheme: dark) {
  .dark-toggle.active {
    background: rgba(255, 255, 255, 0.15);
  }
}
</style>
