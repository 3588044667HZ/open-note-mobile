<template>
  <div class="skin-picker-panel">
    <button
      v-for="id in SKIN_ORDER"
      :key="id"
      class="skin-dot"
      :class="{ active: currentSkin === id }"
      :style="{ backgroundColor: SKINS[id] }"
      :title="SKIN_LABELS[id]"
      @click="$emit('select', id)"
    />
    <span class="skin-spacer"></span>
    <button
      class="eye-toggle"
      :class="{ active: currentSkin === 'yellow' }"
      @click="$emit('toggleEye')"
      title="Eye protection mode"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" :stroke="currentSkin === 'yellow' ? '#96826C' : 'rgba(0,0,0,0.35)'" stroke-width="1.3"/>
        <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" :stroke="currentSkin === 'yellow' ? '#96826C' : 'rgba(0,0,0,0.35)'" stroke-width="1.3"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { SKIN_ORDER, SKIN_LABELS, SKINS, useSkin } from '../composables/useSkin'

defineEmits(['select', 'toggleEye'])

const { currentSkin } = useSkin()
</script>

<style scoped>
.skin-spacer {
  width: 1px;
  height: 16px;
  background: rgba(0,0,0,0.08);
  margin: 0 4px;
}

.eye-toggle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.eye-toggle:active {
  background: rgba(0,0,0,0.06);
}

.eye-toggle.active {
  background: rgba(254, 247, 226, 0.5);
}
</style>
