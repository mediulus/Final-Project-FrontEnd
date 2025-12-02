<template>
  <div class="password-input-wrapper">
    <input
      :type="showPassword ? 'text' : 'password'"
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :required="required"
      :placeholder="placeholder"
      :class="inputClass"
      v-bind="$attrs"
    />
    <button
      type="button"
      class="password-toggle-btn"
      @click="togglePasswordVisibility"
      :title="showPassword ? 'Hide password' : 'Show password'"
    >
      {{ showPassword ? 'Hide' : 'Show' }}
    </button>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'PasswordInput',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    id: String,
    required: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Enter password'
    },
    inputClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup() {
    const showPassword = ref(false)

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    return {
      showPassword,
      togglePasswordVisibility
    }
  }
}
</script>

<style scoped>
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.password-input-wrapper input {
  /* Inherit all the same styles as regular form inputs */
  padding: 0.75rem;
  padding-right: 60px; /* Make space for the button */
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
}

.password-input-wrapper input:focus {
  outline: none;
  border-color: #1e5a2e;
}

.password-toggle-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  color: #666;
  font-weight: 500;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
}

.password-toggle-btn:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
  color: #495057;
}

.password-toggle-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: -2px;
  border-color: #007bff;
}
</style>
