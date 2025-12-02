<template>
  <main class="login-page">
    <div class="login-container">
      <h1>Login to DAM Good Housing</h1>
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
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #123619 0%, #1e5a2e 100%);
}

.login-container {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
}

h1 {
  text-align: center;
  color: #123619;
  margin-bottom: 2rem;
  font-size: 1.8rem;
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
  color: #123619;
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
  border-color: #1e5a2e;
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
  background: linear-gradient(135deg, #123619 0%, #1e5a2e 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(18, 54, 25, 0.4);
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
  color: #1e5a2e;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
