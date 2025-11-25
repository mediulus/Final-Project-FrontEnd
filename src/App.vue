<template>
  <div class="app">
    <nav v-if="showNavbar" class="navbar">
      <div class="nav-container">
        <router-link to="/home" class="logo">DAM Good Housing</router-link>
        <ul class="nav-menu">
          <li><router-link to="/home">Find Housing</router-link></li>
          <li><router-link to="/find-roommates">Find Roommates</router-link></li>
          <li><router-link to="/favorites">Favorites</router-link></li>
        </ul>

        <!-- Profile Circle -->
        <div class="profile-section">
          <div class="profile-circle" @click="toggleProfileDropdown">
            {{ userInitial }}
          </div>

          <!-- Profile Dropdown -->
          <div v-if="showProfileDropdown" class="profile-dropdown" @click.stop>
            <div class="dropdown-header">
              <h3>Profile</h3>
              <button @click="toggleProfileDropdown" class="close-btn">×</button>
            </div>

            <div class="profile-info">
              <!-- Username -->
              <div class="info-row">
                <label>Username</label>
                <div class="info-value">
                  <input
                    v-if="editing.username"
                    v-model="userInfo.username"
                    @blur="saveField('username')"
                    @keyup.enter="saveField('username')"
                  />
                  <span v-else>{{ userInfo.username }}</span>
                  <button @click="editField('username')" class="edit-btn">✏️</button>
                </div>
              </div>

              <!-- Email -->
              <div class="info-row">
                <label>Email</label>
                <div class="info-value">
                  <input
                    v-if="editing.email"
                    v-model="userInfo.email"
                    @blur="saveField('email')"
                    @keyup.enter="saveField('email')"
                    type="email"
                  />
                  <span v-else>{{ userInfo.email }}</span>
                  <button @click="editField('email')" class="edit-btn">✏️</button>
                </div>
              </div>

              <!-- Age -->
              <div class="info-row">
                <label>Age</label>
                <div class="info-value">
                  <input
                    v-if="editing.age"
                    v-model.number="userInfo.age"
                    @blur="saveField('age')"
                    @keyup.enter="saveField('age')"
                    type="number"
                  />
                  <span v-else>{{ userInfo.age }}</span>
                  <button @click="editField('age')" class="edit-btn">✏️</button>
                </div>
              </div>

              <!-- Gender -->
              <div class="info-row">
                <label>Gender</label>
                <div class="info-value">
                  <select
                    v-if="editing.gender"
                    v-model="userInfo.gender"
                    @blur="saveField('gender')"
                    @change="saveField('gender')"
                  >
                    <option :value="0">Male</option>
                    <option :value="1">Female</option>
                    <option :value="2">Non-binary</option>
                    <option :value="3">Other</option>
                  </select>
                  <span v-else>{{ genderText }}</span>
                  <button @click="editField('gender')" class="edit-btn">✏️</button>
                </div>
              </div>

              <!-- Affiliation -->
              <div class="info-row">
                <label>Affiliation</label>
                <div class="info-value">
                  <select
                    v-if="editing.affiliation"
                    v-model="userInfo.affiliation"
                    @blur="saveField('affiliation')"
                    @change="saveField('affiliation')"
                  >
                    <option :value="0">Student</option>
                    <option :value="1">Faculty</option>
                    <option :value="2">Staff</option>
                    <option :value="3">Alumni</option>
                  </select>
                  <span v-else>{{ affiliationText }}</span>
                  <button @click="editField('affiliation')" class="edit-btn">✏️</button>
                </div>
              </div>
            </div>

            <div class="dropdown-footer">
              <button @click="handleLogout" class="logout-btn-dropdown">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, userInfo as userInfoApi } from './utils/api.js';
import { useSessionStore } from './stores/session.js';

export default {
  name: 'App',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const showNavbar = ref(true);
    const showProfileDropdown = ref(false);
    const sessionStore = useSessionStore();
    const editing = ref({
      username: false,
      email: false,
      age: false,
      gender: false,
      affiliation: false
    });

    // Hide navbar on register and login pages
    watch(() => route.path, (newPath) => {
      showNavbar.value = newPath !== '/register' && newPath !== '/login';
    }, { immediate: true });

    const userInitial = computed(() => {
      return sessionStore.user && sessionStore.user.username ? sessionStore.user.username.charAt(0).toUpperCase() : 'U';
    });

    const genderText = computed(() => {
      const genderMap = { 0: 'Male', 1: 'Female', 2: 'Non-binary', 3: 'Other' };
      return sessionStore.user && typeof sessionStore.user.gender !== 'undefined'
        ? genderMap[sessionStore.user.gender] || 'Not specified'
        : 'Not specified';
    });

    const affiliationText = computed(() => {
      const affiliationMap = { 0: 'Student', 1: 'Faculty', 2: 'Staff', 3: 'Alumni' };
      return sessionStore.user && typeof sessionStore.user.affiliation !== 'undefined'
        ? affiliationMap[sessionStore.user.affiliation] || 'Not specified'
        : 'Not specified';
    });

    const toggleProfileDropdown = () => {
      showProfileDropdown.value = !showProfileDropdown.value;
    };

    const editField = (field) => {
      editing.value[field] = true;
    };

    const saveField = async (field) => {
      editing.value[field] = false;
      try {
        // Update user info on backend based on field
        if (!sessionStore.user) return;
        switch(field) {
          case 'age':
            await userInfoApi.updateAge(sessionStore.user.id, sessionStore.user.age);
            break;
          case 'gender':
            await userInfoApi.updateGender(sessionStore.user.id, sessionStore.user.gender);
            break;
          case 'affiliation':
            await userInfoApi.updateAffiliation(sessionStore.user.id, sessionStore.user.affiliation);
            break;
          case 'email':
            await userInfoApi.updateEmailAddress(sessionStore.user.id, sessionStore.user.email);
            break;
        }
      } catch (error) {
        console.error(`Failed to update ${field}:`, error);
        // Optionally reload user data from backend here
      }
    };

    const handleLogout = async () => {
      try {
        await auth.logout();
        sessionStore.clearToken();
        sessionStore.clearUser();
        alert('You have been logged out.');
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        sessionStore.clearToken();
        sessionStore.clearUser();
        alert('Logout failed, but you have been redirected to login.');
        router.push('/login');
      }
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showProfileDropdown.value && !event.target.closest('.profile-section')) {
        showProfileDropdown.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    return {
      showNavbar,
      showProfileDropdown,
      editing,
      userInitial,
      genderText,
      affiliationText,
      toggleProfileDropdown,
      editField,
      saveField,
      handleLogout,
      sessionStore
    };
  }
}
</script>

<style>
@import './App.css';
</style>
