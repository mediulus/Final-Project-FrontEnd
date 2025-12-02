<template>
  <main class="login-page">
    <div class="split-layout">
      <!-- Left Side - Branding -->
      <div class="branding-panel">
        <div class="branding-content">
          <h1 class="branding-title">Dam Good Housing</h1>
          <p class="branding-tagline">So every beaver finds a dam!</p>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="form-panel">
        <div class="login-container">
          <h2>Login</h2>
          <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            required
            placeholder="Enter your username"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <PasswordInput
            id="password"
            v-model="formData.password"
            required
            placeholder="Enter your password"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? "Logging in..." : "Login" }}
        </button>

        <p class="register-link">
          Don't have an account?
          <router-link to="/register">Register here</router-link>
        </p>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, userInfo as userInfoApi } from "../utils/api.js";
import { useSessionStore } from "../stores/session.js";
import PasswordInput from "../components/PasswordInput.vue";

export default {
  name: "Login",
  components: {
    PasswordInput
  },
  setup() {
    const router = useRouter();
    const isLoading = ref(false);
    const errorMessage = ref("");
    const sessionStore = useSessionStore();

    const formData = ref({
      username: "",
      password: "",
    });

    const handleLogin = async () => {
      isLoading.value = true;
      errorMessage.value = "";

      try {
        // Authenticate user
        console.log("Attempting login with username:", formData.value.username);
        const authResult = await auth.login(
          formData.value.username,
          formData.value.password
        );
        console.log("Auth result:", authResult);
        console.log("Auth result type:", typeof authResult);
        console.log(
          "Auth result keys:",
          authResult ? Object.keys(authResult) : "null"
        );

        if (!authResult) {
          throw new Error("Authentication failed - no response");
        }

        // Backend returns session directly from authenticate endpoint
        let sessionToken;
        let userId;

        if (authResult.session) {
          // Backend creates session automatically during authentication
          sessionToken = authResult.session;
          console.log("Session token from auth:", sessionToken);

          // We can get user ID from session token or use username as fallback
          userId = authResult.user || formData.value.username;
        } else if (authResult.user) {
          // Old flow: get user ID, then create session
          userId = authResult.user;
          console.log("User ID:", userId);

          // Create session
          console.log("Creating session for user:", userId);
          const sessionResult = await auth.createSession(userId);
          console.log("Session result:", sessionResult);

          if (!sessionResult || !sessionResult.session) {
            throw new Error("Failed to create session");
          }

          sessionToken = sessionResult.session;
          console.log("Session token:", sessionToken);
        } else {
          console.error("Unexpected auth result format:", authResult);
          throw new Error("Authentication failed - invalid response format");
        }

        // Store session token
        sessionStore.setToken(sessionToken);

        // Fetch full user info using the session to get the actual user ID
        try {
          const userInfoResult = await userInfoApi.getUserInfo();
          console.log("[Login] User info result:", userInfoResult);

          if (userInfoResult && userInfoResult.user) {
            // Store user info with the actual user ID from the backend
            sessionStore.setUser({
              id: userInfoResult.user,
              username: formData.value.username,
              age: userInfoResult.age,
              gender: userInfoResult.gender,
              affiliation: userInfoResult.affiliation,
              emailAddress: userInfoResult.emailAddress,
            });
          } else {
            // Fallback: store basic info if getUserInfo fails
            sessionStore.setUser({
              id: userId,
              username: formData.value.username,
            });
          }
        } catch (err) {
          console.error("[Login] Failed to fetch user info:", err);
          // Fallback: store basic info if getUserInfo fails
          sessionStore.setUser({
            id: userId,
            username: formData.value.username,
          });
        }

        console.log("Session store after login:", {
          token: sessionStore.token,
          user: sessionStore.user,
        });

        // Redirect to home page (Find Housing)
        router.push("/home");
      } catch (error) {
        console.error("Login error:", error);
        errorMessage.value =
          error.message || "Login failed. Please check your credentials.";
      } finally {
        isLoading.value = false;
      }
    };

    return {
      formData,
      isLoading,
      errorMessage,
      handleLogin,
    };
  },
};
</script>

<style scoped>
.login-page {
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

.login-container {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba(47, 71, 62, 0.1);
}

h2 {
  text-align: center;
  color: rgb(47, 71, 62);
  margin: 0 0 2rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
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

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.95rem;
}

.register-link a {
  color: rgb(22, 53, 27);
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
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

  .login-container {
    padding: 2rem;
  }
}
</style>
