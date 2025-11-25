
<template>
  <main class="page">
    <section class="content">
      <h2>Find Roommates</h2>
      <p>Connect with potential roommates</p>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="isLoading">Loading roommate postings...</div>
      <div v-else>
        <h3>Current Roommate Postings</h3>
        <ul>
          <li v-for="posting in postings" :key="posting._id" class="posting-item">
            <strong>{{ posting.poster }}</strong> ({{ posting.age }}, {{ posting.gender }}, {{ posting.city }})<br>
            <span>{{ posting.description }}</span>
          </li>
        </ul>
      </div>
  <button class="plus-btn" @click="openModal" title="Create Roommate Posting">+</button>
  <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h3>Create Your Roommate Posting</h3>
          <form @submit.prevent="emitCreatePosting" class="posting-form">
            <div>
              <label>City:</label>
              <input v-model="form.city" required />
            </div>
            <div>
              <label>Gender:</label>
              <input v-model="form.gender" required />
            </div>
            <div>
              <label>Age:</label>
              <input v-model.number="form.age" type="number" min="0" required />
            </div>
            <div>
              <label>Description:</label>
              <textarea v-model="form.description" required></textarea>
            </div>
            <button type="submit" :disabled="isCreating">{{ isCreating ? 'Posting...' : 'Create Posting' }}</button>
            <div v-if="createError" class="error-message">{{ createError }}</div>
          </form>
          <button class="close-modal-btn" @click="closeModal">Close</button>
        </div>
      </div>
    </section>
  </main>
</template>


<script>
import { ref } from 'vue';
import { useSessionStore } from '../stores/session.js';

export default {
  name: 'FindRoommates',
  props: {
    postings: {
      type: Array,
      default: () => [
        { _id: 1, poster: 'Demo User', age: 22, gender: 'Female', city: 'Cambridge', description: 'Looking for a roommate near MIT.' }
      ]
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    showCreateModal: {
      type: Boolean,
      default: undefined
    },
    isCreating: {
      type: Boolean,
      default: false
    },
    createError: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    const form = ref({
      city: '',
      gender: '',
      age: '',
      description: ''
    });
    const sessionStore = useSessionStore();

    // Local modal state fallback
    const localModal = ref(false);
    const modalVisible = computed(() =>
      typeof props.showCreateModal === 'boolean' ? props.showCreateModal : localModal.value
    );

    const openModal = () => {
      if (typeof props.showCreateModal === 'boolean') {
        emit('open-create-modal');
      } else {
        localModal.value = true;
      }
    };
    const closeModal = () => {
      if (typeof props.showCreateModal === 'boolean') {
        emit('close-create-modal');
      } else {
        localModal.value = false;
      }
    };

    const emitCreatePosting = () => {
      emit('create-posting', {
        ...form.value,
        poster: sessionStore.user && sessionStore.user.id ? sessionStore.user.id : null,
        session: sessionStore.token ? sessionStore.token : null
      });
      // Optionally clear form after emit
      form.value = { city: '', gender: '', age: '', description: '' };
      closeModal();
    };

    return {
      form,
      sessionStore,
      emitCreatePosting,
      openModal,
      closeModal,
      modalVisible
    };
  }
};
</script>

<style scoped>
.plus-btn {
  position: fixed;
  bottom: 2.5rem;
  right: 2.5rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e5a2e 0%, #2d7a3e 100%);
  color: #fff;
  font-size: 2.5rem;
  font-weight: bold;
  border: none;
  box-shadow: 0 4px 16px rgba(44,62,80,0.15);
  cursor: pointer;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
}
.plus-btn:hover {
  background: #123619;
  transform: scale(1.08);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(44,62,80,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.modal-content {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(44,62,80,0.18);
  padding: 2.5rem 2rem;
  min-width: 340px;
  max-width: 95vw;
  text-align: left;
  position: relative;
}
.close-modal-btn {
  margin-top: 1.5rem;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.close-modal-btn:hover {
  background: #c82333;
}
</style>
