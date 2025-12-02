<template>
  <main class="register-page">
    <div class="split-layout">
      <!-- Left Side - Branding -->
      <div class="branding-panel">
        <div class="branding-content">
          <h1 class="branding-title">Dam Good Housing</h1>
          <p class="branding-tagline">So every beaver finds a dam!</p>
        </div>
      </div>

      <!-- Right Side - Register Form -->
      <div class="form-panel">
        <div class="register-container">
          <h2>Register</h2>
          <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">Username *</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            required
            placeholder="Enter your username"
          />
        </div>

        <div class="form-group">
          <label for="password">Password *</label>
          <PasswordInput
            id="password"
            v-model="formData.password"
            required
            placeholder="Enter your password"
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address *</label>
          <input
            type="email"
            id="email"
            v-model="formData.emailAddress"
            required
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="age">Age *</label>
          <input
            type="number"
            id="age"
            v-model.number="formData.age"
            required
            min="18"
            max="120"
            placeholder="Enter your age"
          />
        </div>

        <div class="form-group">
          <label for="gender">Gender *</label>
          <select id="gender" v-model.number="formData.gender" required>
            <option value="" disabled>Select your gender</option>
            <option :value="0">Male</option>
            <option :value="1">Female</option>
            <option :value="2">Non-binary</option>
            <option :value="3">Prefer not to say</option>
          </select>
        </div>

        <div class="form-group">
          <label for="affiliation">Affiliation *</label>
          <select id="affiliation" v-model.number="formData.affiliation" required>
            <option value="" disabled>Select your affiliation</option>
            <option :value="0">MIT Student</option>
            <option :value="1">MIT Faculty</option>
            <option :value="2">MIT Staff</option>
            <option :value="3">Other</option>
          </select>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>

        <p class="login-link">
          Already have an account? <router-link to="/login">Login here</router-link>
        </p>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../utils/api.js';
import { useSessionStore } from '../stores/session.js';
import PasswordInput from '../components/PasswordInput.vue';

export default {
  name: 'Register',
  components: {
    PasswordInput
  },
  setup() {
    const router = useRouter();
    const sessionStore = useSessionStore();
    const isLoading = ref(false);
    const errorMessage = ref('');

    const formData = ref({
      username: '',
      password: '',
      emailAddress: '',
      age: '',
      gender: '',
      affiliation: ''
    });

    const handleRegister = async () => {
      isLoading.value = true;
      errorMessage.value = '';

      try {
        const result = await auth.register(
          formData.value.username,
          formData.value.password,
          formData.value.age,
          formData.value.gender,
          formData.value.affiliation,
          formData.value.emailAddress
        );

        // Registration successful, redirect to login
        router.push('/login');
      } catch (error) {
        errorMessage.value = error.message || 'Registration failed. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      formData,
      isLoading,
      errorMessage,
      handleRegister
    };
  }
};
</script>

<style scoped>
.register-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.split-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

/* Left Panel - Branding */
.branding-panel {
  flex: 1;
  background: rgb(47, 71, 62);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: white;
}

.branding-content {
  text-align: center;
  max-width: 500px;
}

.branding-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  color: white;
}

.branding-tagline {
  font-size: 1.5rem;
  font-weight: 300;
  font-style: italic;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

/* Right Panel - Form */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: #f5f0e8;
  overflow-y: auto;
}

.register-container {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(47, 71, 62, 0.1);
}

h2 {
  text-align: center;
  color: rgb(47, 71, 62);
  margin: 0 0 2rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: rgb(47, 71, 62);
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: rgb(47, 71, 62);
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid #fcc;
}

.submit-btn {
  padding: 0.875rem;
  background: rgb(47, 71, 62);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: rgb(22, 53, 27);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(47, 71, 62, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.95rem;
}

.login-link a {
  color: rgb(22, 53, 27);
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
  color: rgb(47, 71, 62);
}

/* Responsive Design */
@media (max-width: 968px) {
  .split-layout {
    flex-direction: column;
  }

  .branding-panel {
    min-height: 40vh;
    padding: 2rem;
  }

  .branding-title {
    font-size: 2.5rem;
  }

  .branding-tagline {
    font-size: 1.2rem;
  }

  .form-panel {
    padding: 2rem;
  }

  .register-container {
    padding: 2rem;
  }
}
</style>
