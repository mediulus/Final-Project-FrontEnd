<template>
  <main class="page">
    <section class="content">
      <h2>Profile</h2>
      <p>Your account information and settings</p>

      <!-- User Info Section -->
      <div class="user-info" v-if="sessionStore.user">
        <h3>Account Information</h3>
        <p><strong>Username:</strong> {{ sessionStore.user.username }}</p>
        <p><strong>Email:</strong> {{ sessionStore.user.email }}</p>
      </div>

      <!-- Danger Zone -->
      <div class="danger-zone">
        <h3>Danger Zone</h3>
        <p>Once you delete your account, there is no going back. Please be certain.</p>

        <div v-if="!showDeleteConfirm">
          <button class="delete-btn" @click="showDeleteConfirm = true">
            Delete Account
          </button>
        </div>

        <div v-else class="delete-confirm">
          <p><strong>This action cannot be undone.</strong> Please enter your password to confirm:</p>
          <input
            type="password"
            v-model="deletePassword"
            placeholder="Enter your password"
            class="password-input"
            @keyup.enter="handleDeleteAccount"
          />
          <div class="button-group">
            <button
              @click="handleDeleteAccount"
              :disabled="isDeleting || !deletePassword"
              class="confirm-delete-btn"
            >
              {{ isDeleting ? 'Deleting...' : 'Confirm Delete Account' }}
            </button>
            <button
              @click="cancelDelete"
              :disabled="isDeleting"
              class="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { ref } from 'vue'
import { useSessionStore } from '../stores/session.js'
import { useRouter } from 'vue-router'
import api from '../utils/api.js'

export default {
  name: 'Profile',
  setup() {
    const sessionStore = useSessionStore()
    const router = useRouter()

    const showDeleteConfirm = ref(false)
    const deletePassword = ref('')
    const isDeleting = ref(false)

    const handleDeleteAccount = async () => {
      if (!deletePassword.value) {
        alert('Please enter your password to confirm deletion')
        return
      }

      isDeleting.value = true

      try {
        await api.auth.deleteAccount(deletePassword.value)

        // Clear session and redirect
        sessionStore.clearToken()
        sessionStore.clearUser()

        alert('Account deleted successfully')
        router.push('/')
      } catch (error) {
        console.error('Delete account error:', error)
        alert('Failed to delete account. Please check your password and try again.')
      } finally {
        isDeleting.value = false
        cancelDelete()
      }
    }

    const cancelDelete = () => {
      showDeleteConfirm.value = false
      deletePassword.value = ''
    }

    return {
      sessionStore,
      showDeleteConfirm,
      deletePassword,
      isDeleting,
      handleDeleteAccount,
      cancelDelete
    }
  }
}
</script>

<style scoped>
.user-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.user-info h3 {
  margin-top: 0;
  color: #333;
}

.danger-zone {
  margin-top: 40px;
  padding: 20px;
  border: 2px solid #dc3545;
  border-radius: 8px;
  background-color: #fff5f5;
}

.danger-zone h3 {
  color: #dc3545;
  margin-top: 0;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: #c82333;
}

.delete-confirm {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.password-input {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  max-width: 300px;
}

.password-input:focus {
  outline: none;
  border-color: #007bff;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.confirm-delete-btn {
  background-color: #dc3545;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.confirm-delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.confirm-delete-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.cancel-btn:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
}
</style>
