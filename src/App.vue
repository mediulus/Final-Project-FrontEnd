<template>
  <div class="app">
    <nav v-if="showNavbar" class="navbar">
      <div class="nav-container">
        <router-link to="/home" class="logo">DAM Good Housing</router-link>
        <ul class="nav-menu">
          <li><router-link to="/home">Find Housing</router-link></li>
          <li>
            <router-link to="/find-roommates">Find Roommates</router-link>
          </li>
          <li><router-link to="/favorites">Favorites</router-link></li>
          <li><router-link to="/my-postings">My Postings</router-link></li>
        </ul>

        <!-- Profile Circle -->
        <div class="profile-section">
          <div class="profile-circle" @click="toggleProfileDropdown">
            {{ userInitial }}
          </div>

          <!-- Profile Dropdown -->
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
                    ✏️
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
                    ✏️
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
                    ✏️
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
                    ✏️
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
                v-if="!showDeleteConfirm"
                @click="showDeleteConfirm = true"
                class="delete-account-btn"
              >
                Delete Account
              </button>
              <button @click.stop="handleLogout" class="logout-btn-dropdown">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <router-view />
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

    // Hide navbar on register and login pages
    watch(
      () => route.path,
      (newPath) => {
        showNavbar.value = newPath !== "/register" && newPath !== "/login";
      },
      { immediate: true }
    );

    // Reset delete account state when user changes (login/logout)
    watch(
      () => sessionStore.user,
      () => {
        cancelDelete();
      }
    );

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
      const wasOpen = showProfileDropdown.value;
      showProfileDropdown.value = !showProfileDropdown.value;

      // Reset delete account state when opening dropdown
      if (!wasOpen && showProfileDropdown.value) {
        cancelDelete();
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

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        showProfileDropdown.value &&
        !event.target.closest(".profile-section")
      ) {
        showProfileDropdown.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
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
      sessionStore,
      // Delete account functionality
      showDeleteConfirm,
      deletePassword,
      isDeleting,
      showDeletePassword,
      handleDeleteAccount,
      cancelDelete,
    };
  },
};
</script>

<style>
@import "./App.css";
</style>
