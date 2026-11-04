<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  id: string
  label: string
  type?: string
  hint?: string
  error?: string
}>(), {
  type: 'text',
  hint: '',
  error: ''
})

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="app-field">
    <label :for="id">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :aria-invalid="Boolean(error)"
      :aria-describedby="hint || error ? `${id}-help` : undefined"
      v-bind="$attrs"
    >
    <p v-if="error || hint" :id="`${id}-help`" class="app-field__help" :class="{ 'app-field__help--error': error }">
      {{ error || hint }}
    </p>
  </div>
</template>
