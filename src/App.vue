<template>
  <div class="app">
    <!-- Sidebar Toggle Button removed - sidebar always visible -->

    <!-- Sidebar Navigation -->
    <nav v-if="showNavbar" class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <router-link to="/home" class="logo">Dam Good Housing</router-link>
      </div>

      <ul class="nav-menu">
        <li>
          <router-link to="/home">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span class="nav-text">Housing</span>
          </router-link>
        </li>
        <li>
          <router-link to="/find-roommates">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span class="nav-text">Roommates</span>
          </router-link>
        </li>
        <li>
          <router-link to="/favorites">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="nav-text">Favorites</span>
          </router-link>
        </li>
        <li>
          <router-link to="/my-postings">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span class="nav-text">My Postings</span>
          </router-link>
        </li>
      </ul>

      <!-- Profile Section in Sidebar -->
      <div class="sidebar-profile-wrapper">
        <img src="./assets/beaver.png" alt="Beaver mascot" class="beaver-image" />
        <div class="sidebar-profile">
          <div class="profile-circle" @click="toggleProfileDropdown">
            {{ userInitial }}
          </div>
          <div class="profile-name">{{ sessionStore.user?.username || "User" }}</div>
        </div>
      </div>
    </nav>

    <!-- Overlay for sidebar removed - sidebar always visible -->

    <!-- Profile Dropdown Backdrop -->
    <div v-if="showProfileDropdown && sessionStore.user" class="profile-backdrop" @click="toggleProfileDropdown"></div>

    <!-- Profile Dropdown Modal -->
    <div
      v-if="showProfileDropdown && sessionStore.user"
      class="profile-dropdown"
      @click.stop
    >
      <div class="dropdown-header">
        <h3>Profile</h3>
        <button @click="toggleProfileDropdown" class="close-btn">
          ×
        </button>
      </div>

      <div class="profile-info">
        <!-- Username -->
        <div class="info-row">
          <label>Username</label>
          <div class="info-value">
            <span>{{ sessionStore.user?.username || "N/A" }}</span>
          </div>
        </div>

        <!-- Email -->
        <div class="info-row">
          <label>Email</label>
          <div class="info-value">
            <input
              v-if="editing.email && sessionStore.user"
              v-model="sessionStore.user.emailAddress"
              @blur="saveField('email')"
              @keyup.enter="saveField('email')"
              type="email"
            />
            <span v-else>{{
              sessionStore.user?.emailAddress || "N/A"
            }}</span>
            <button
              v-if="editing.email"
              @click="saveField('email')"
              class="edit-btn"
              title="Save"
            >
              ✓
            </button>
            <button
              v-else
              @click="editField('email')"
              class="edit-btn"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Age -->
        <div class="info-row">
          <label>Age</label>
          <div class="info-value">
            <input
              v-if="editing.age && sessionStore.user"
              v-model.number="sessionStore.user.age"
              @blur="saveField('age')"
              @keyup.enter="saveField('age')"
              type="number"
            />
            <span v-else>{{ sessionStore.user?.age || "N/A" }}</span>
            <button
              v-if="editing.age"
              @click="saveField('age')"
              class="edit-btn"
              title="Save"
            >
              ✓
            </button>
            <button
              v-else
              @click="editField('age')"
              class="edit-btn"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Gender -->
        <div class="info-row">
          <label>Gender</label>
          <div class="info-value">
            <select
              v-if="editing.gender && sessionStore.user"
              v-model="sessionStore.user.gender"
              @blur="saveField('gender')"
              @change="saveField('gender')"
            >
              <option :value="0">Male</option>
              <option :value="1">Female</option>
              <option :value="2">Non-binary</option>
              <option :value="3">Other</option>
            </select>
            <span v-else>{{ genderText }}</span>
            <button
              v-if="editing.gender"
              @click="saveField('gender')"
              class="edit-btn"
              title="Save"
            >
              ✓
            </button>
            <button
              v-else
              @click="editField('gender')"
              class="edit-btn"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Affiliation -->
        <div class="info-row">
          <label>Affiliation</label>
          <div class="info-value">
            <select
              v-if="editing.affiliation && sessionStore.user"
              v-model="sessionStore.user.affiliation"
              @blur="saveField('affiliation')"
              @change="saveField('affiliation')"
            >
              <option :value="0">Student</option>
              <option :value="1">Faculty</option>
              <option :value="2">Staff</option>
              <option :value="3">Alumni</option>
            </select>
            <span v-else>{{ affiliationText }}</span>
            <button
              v-if="editing.affiliation"
              @click="saveField('affiliation')"
              class="edit-btn"
              title="Save"
            >
              ✓
            </button>
            <button
              v-else
              @click="editField('affiliation')"
              class="edit-btn"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div v-if="showChangePassword" class="change-password-section">
        <div class="change-password-form">
          <h4>Change Password</h4>
          <div class="password-field">
            <label>Current Password</label>
            <div class="password-input-wrapper">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                v-model="currentPassword"
                placeholder="Enter current password"
                class="password-input"
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="showCurrentPassword = !showCurrentPassword"
                :title="showCurrentPassword ? 'Hide password' : 'Show password'"
              >
                {{ showCurrentPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>
          <div class="password-field">
            <label>New Password</label>
            <div class="password-input-wrapper">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                v-model="newPassword"
                placeholder="Enter new password"
                class="password-input"
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="showNewPassword = !showNewPassword"
                :title="showNewPassword ? 'Hide password' : 'Show password'"
              >
                {{ showNewPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>
          <div class="change-password-buttons">
            <button
              @click="handleChangePassword"
              :disabled="isChangingPassword || !currentPassword || !newPassword"
              class="confirm-change-btn"
            >
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </button>
            <button
              @click="cancelChangePassword"
              :disabled="isChangingPassword"
              class="cancel-change-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Account Section -->
      <div v-if="showDeleteConfirm" class="delete-confirm-section">
        <div class="delete-warning">
          <h4>Delete Account</h4>
          <p><strong>This action cannot be undone.</strong></p>
          <p>Enter your password to confirm:</p>
          <div class="password-input-wrapper">
            <input
              :type="showDeletePassword ? 'text' : 'password'"
              v-model="deletePassword"
              placeholder="Enter your password"
              class="delete-password-input"
              @keyup.enter="handleDeleteAccount"
            />
            <button
              type="button"
              class="password-toggle-btn"
              @click="showDeletePassword = !showDeletePassword"
              :title="showDeletePassword ? 'Hide password' : 'Show password'"
            >
              {{ showDeletePassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <div class="delete-buttons">
            <button
              @click="handleDeleteAccount"
              :disabled="isDeleting || !deletePassword"
              class="confirm-delete-btn"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
            </button>
            <button
              @click="cancelDelete"
              :disabled="isDeleting"
              class="cancel-delete-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div class="dropdown-footer">
        <button
          v-if="!showDeleteConfirm && !showChangePassword"
          @click="showChangePassword = true"
          class="change-password-btn"
        >
          Change Password
        </button>
        <button
          v-if="!showDeleteConfirm && !showChangePassword"
          @click="showDeleteConfirm = true"
          class="delete-account-btn"
        >
          Delete Account
        </button>
        <button @click.stop="handleLogout" class="logout-btn-dropdown">Logout</button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'sidebar-open': sidebarOpen && showNavbar }">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref, watch, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { auth, userInfo as userInfoApi } from "./utils/api.js";
import { useSessionStore } from "./stores/session.js";

export default {
  name: "App",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const showNavbar = ref(true);
    // Sidebar always stays open
    const sidebarOpen = ref(true);
    const showProfileDropdown = ref(false);
    const sessionStore = useSessionStore();
    const editing = ref({
      email: false,
      age: false,
      gender: false,
      affiliation: false,
    });

    // Delete account variables
    const showDeleteConfirm = ref(false);
    const deletePassword = ref('');
    const isDeleting = ref(false);
    const showDeletePassword = ref(false);

    // Change password variables
    const showChangePassword = ref(false);
    const currentPassword = ref('');
    const newPassword = ref('');
    const isChangingPassword = ref(false);
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);

    // Track if we're on mobile
    const isMobile = ref(window.innerWidth <= 768);

    // Update isMobile on window resize
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    onMounted(() => {
      window.addEventListener('resize', handleResize);
    });

    // Hide navbar on register and login pages
    watch(
      () => route.path,
      (newPath) => {
        showNavbar.value = newPath !== "/register" && newPath !== "/login";
        // Sidebar always stays open
        // No longer closing sidebar on mobile navigation
      },
      { immediate: true }
    );

    // Reset delete account and change password state when user changes (login/logout)
    watch(
      () => sessionStore.user,
      () => {
        cancelDelete();
        cancelChangePassword();
      }
    );

    // Sidebar toggle removed - sidebar always stays open
    const toggleSidebar = () => {
      // No longer toggling - sidebar stays open
    };

    const userInitial = computed(() => {
      return sessionStore.user && sessionStore.user.username
        ? sessionStore.user.username.charAt(0).toUpperCase()
        : "U";
    });

    const genderText = computed(() => {
      const genderMap = { 0: "Male", 1: "Female", 2: "Non-binary", 3: "Other" };
      return sessionStore.user &&
        typeof sessionStore.user.gender !== "undefined"
        ? genderMap[sessionStore.user.gender] || "Not specified"
        : "Not specified";
    });

    const affiliationText = computed(() => {
      const affiliationMap = {
        0: "Student",
        1: "Faculty",
        2: "Staff",
        3: "Alumni",
      };
      return sessionStore.user &&
        typeof sessionStore.user.affiliation !== "undefined"
        ? affiliationMap[sessionStore.user.affiliation] || "Not specified"
        : "Not specified";
    });

    const toggleProfileDropdown = async () => {
      console.log('[App.vue] toggleProfileDropdown called');
      console.log('[App.vue] Current showProfileDropdown:', showProfileDropdown.value);
      console.log('[App.vue] sessionStore.user:', sessionStore.user);

      const wasOpen = showProfileDropdown.value;
      showProfileDropdown.value = !showProfileDropdown.value;

      console.log('[App.vue] New showProfileDropdown:', showProfileDropdown.value);

      // Reset delete account and change password state when opening dropdown
      if (!wasOpen && showProfileDropdown.value) {
        cancelDelete();
        cancelChangePassword();
      }

      // If opening the dropdown and we don't have full user info, fetch it
      if (
        !wasOpen &&
        showProfileDropdown.value &&
        sessionStore.user &&
        sessionStore.token
      ) {
        // Check if we already have full user info (age, gender, etc.)
        const hasFullInfo =
          sessionStore.user.age !== undefined &&
          sessionStore.user.gender !== undefined &&
          sessionStore.user.affiliation !== undefined &&
          sessionStore.user.emailAddress !== undefined;

        if (!hasFullInfo) {
          try {
            console.log("[App.vue] Fetching user info for profile dropdown");
            const userInfoResult = await userInfoApi.getUserInfo();
            console.log("[App.vue] User info result:", userInfoResult);

            // The result is an array, get the first item
            if (
              userInfoResult &&
              Array.isArray(userInfoResult) &&
              userInfoResult.length > 0
            ) {
              const info = userInfoResult[0];
              // Update the user in session store with the fetched info
              sessionStore.setUser({
                ...sessionStore.user,
                id: info.user,
                age: info.age,
                gender: info.gender,
                affiliation: info.affiliation,
                emailAddress: info.emailAddress,
              });
              console.log("[App.vue] Updated user info in session store");
            } else if (userInfoResult && !Array.isArray(userInfoResult)) {
              // Handle case where result is not an array
              sessionStore.setUser({
                ...sessionStore.user,
                id: userInfoResult.user,
                age: userInfoResult.age,
                gender: userInfoResult.gender,
                affiliation: userInfoResult.affiliation,
                emailAddress: userInfoResult.emailAddress,
              });
            }
          } catch (error) {
            console.error("[App.vue] Failed to fetch user info:", error);
          }
        }
      }
    };

    const editField = (field) => {
      editing.value[field] = true;
    };

    const saveField = async (field) => {
      console.log(`[App.vue] saveField called for field: ${field}`);
      editing.value[field] = false;
      try {
        // Update user info on backend based on field
        if (!sessionStore.user) {
          console.warn("[App.vue] Cannot save field: no user in session store");
          return;
        }

        // Get the user ID - it might be stored as 'id' or 'user'
        // When we fetch user info, we set id: info.user, so use that
        const userId = sessionStore.user.id || sessionStore.user.user;
        if (!userId) {
          console.error(
            "[App.vue] Cannot save field: no user ID found",
            sessionStore.user
          );
          alert(
            "Cannot save: user ID not found. Please refresh and try again."
          );
          return;
        }

        console.log(`[App.vue] Saving ${field} for user ${userId}`, {
          field,
          userId,
          value: sessionStore.user[field === "email" ? "emailAddress" : field],
          sessionToken: sessionStore.token ? "present" : "missing",
        });

        switch (field) {
          case "age":
            if (
              sessionStore.user.age === undefined ||
              sessionStore.user.age === null
            ) {
              console.warn("[App.vue] Age is not set, skipping save");
              return;
            }
            console.log("[App.vue] Calling userInfoApi.updateAge...");
            const ageResult = await userInfoApi.updateAge(
              userId,
              sessionStore.user.age
            );
            console.log("[App.vue] Age updated successfully:", ageResult);
            break;
          case "gender":
            if (
              sessionStore.user.gender === undefined ||
              sessionStore.user.gender === null
            ) {
              console.warn("[App.vue] Gender is not set, skipping save");
              return;
            }
            console.log("[App.vue] Calling userInfoApi.updateGender...");
            const genderResult = await userInfoApi.updateGender(
              userId,
              sessionStore.user.gender
            );
            console.log("[App.vue] Gender updated successfully:", genderResult);
            break;
          case "affiliation":
            if (
              sessionStore.user.affiliation === undefined ||
              sessionStore.user.affiliation === null
            ) {
              console.warn("[App.vue] Affiliation is not set, skipping save");
              return;
            }
            console.log("[App.vue] Calling userInfoApi.updateAffiliation...");
            const affiliationResult = await userInfoApi.updateAffiliation(
              userId,
              sessionStore.user.affiliation
            );
            console.log(
              "[App.vue] Affiliation updated successfully:",
              affiliationResult
            );
            break;
          case "email":
            if (!sessionStore.user.emailAddress) {
              console.warn("[App.vue] Email is not set, skipping save");
              return;
            }
            console.log("[App.vue] Calling userInfoApi.updateEmailAddress...");
            const emailResult = await userInfoApi.updateEmailAddress(
              userId,
              sessionStore.user.emailAddress
            );
            console.log("[App.vue] Email updated successfully:", emailResult);
            break;
          case "username":
            // Username cannot be updated via UserInfo API - there's no updateUsername endpoint
            console.log(
              "[App.vue] Username cannot be updated - no API endpoint exists"
            );
            alert("Username cannot be changed. This feature is not available.");
            break;
        }
      } catch (error) {
        console.error(`[App.vue] Failed to update ${field}:`, error);
        // Revert editing state on error
        editing.value[field] = true;
        alert(
          `Failed to update ${field}: ${
            error.message || "Unknown error"
          }. Please try again.`
        );
      }
    };

    const handleLogout = async () => {
      console.log('Logout button clicked');

      // Clear session immediately for better UX
      sessionStore.clearToken();
      sessionStore.clearUser();
      showProfileDropdown.value = false;

      // Call logout API in background (don't wait for it)
      auth.logout().catch(error => {
        console.warn('Logout API call failed (ignoring):', error);
      });

      console.log('Session cleared, redirecting to login...');
      router.push('/login');
    };    const handleDeleteAccount = async () => {
      if (!deletePassword.value) {
        alert('Please enter your password to confirm deletion');
        return;
      }

      isDeleting.value = true;

      try {
        await auth.deleteAccount(deletePassword.value);

        // Only execute success flow if API call succeeds
        sessionStore.clearToken();
        sessionStore.clearUser();
        showProfileDropdown.value = false;
        cancelDelete(); // Reset form on success

        alert('Account deleted successfully');
        router.push('/');
      } catch (error) {
        console.error('Delete account error:', error);

        // Show specific error message if available
        const errorMessage = error.message || 'Failed to delete account. Please check your password and try again.';
        alert(errorMessage);

        // Don't reset form on error so user can try again
        isDeleting.value = false;
      }
    };

    const cancelDelete = () => {
      showDeleteConfirm.value = false;
      deletePassword.value = '';
      showDeletePassword.value = false;
    };

    const handleChangePassword = async () => {
      if (!currentPassword.value || !newPassword.value) {
        alert('Please enter both current and new passwords');
        return;
      }

      isChangingPassword.value = true;

      try {
        await auth.changePassword(currentPassword.value, newPassword.value);

        alert('Password changed successfully');
        cancelChangePassword();
      } catch (error) {
        console.error('Change password error:', error);
        const errorMessage = error.message || 'Failed to change password. Please check your current password and try again.';
        alert(errorMessage);
        isChangingPassword.value = false;
      }
    };

    const cancelChangePassword = () => {
      showChangePassword.value = false;
      currentPassword.value = '';
      newPassword.value = '';
      showCurrentPassword.value = false;
      showNewPassword.value = false;
      isChangingPassword.value = false;
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        showProfileDropdown.value &&
        !event.target.closest(".sidebar-profile") &&
        !event.target.closest(".profile-dropdown") &&
        !event.target.closest(".profile-backdrop")
      ) {
        showProfileDropdown.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    return {
      showNavbar,
      sidebarOpen,
      toggleSidebar,
      isMobile,
      showProfileDropdown,
      editing,
      userInitial,
      genderText,
      affiliationText,
      toggleProfileDropdown,
      editField,
      saveField,
      handleLogout,
      sessionStore,
      // Delete account functionality
      showDeleteConfirm,
      deletePassword,
      isDeleting,
      showDeletePassword,
      handleDeleteAccount,
      cancelDelete,
      // Change password functionality
      showChangePassword,
      currentPassword,
      newPassword,
      isChangingPassword,
      showCurrentPassword,
      showNewPassword,
      handleChangePassword,
      cancelChangePassword,
    };
  },
};
</script>

<style>
@import "./App.css";
</style>
