<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'success' | 'warning' | 'neutral'
}>(), {
  tone: 'neutral'
})
</script>

<template>
  <p class="status-indicator" :class="`status-indicator--${tone}`" role="status">
    <slot />
  </p>
</template>
