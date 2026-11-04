<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary'
}>(), {
  type: 'button',
  variant: 'primary'
})
</script>

<template>
  <button :type="type" class="app-button" :class="`app-button--${variant}`">
    <slot />
  </button>
</template>
