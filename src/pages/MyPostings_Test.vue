<template>
  <main class="homepage">
    <section class="hero">
      <h2>My Postings - Test</h2>
      <p>Testing if basic component works</p>
    </section>

    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <p>Component loaded successfully!</p>
      <p>Session user: {{ sessionStore.user?.id || 'None' }}</p>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from "vue";
import { useSessionStore } from "../stores/session.js";

export default {
  name: "MyPostingsTest",
  setup() {
    const sessionStore = useSessionStore();
    const isLoading = ref(false);
    const error = ref("");

    onMounted(() => {
      console.log("MyPostings test component mounted successfully");
    });

    return {
      sessionStore,
      isLoading,
      error,
    };
  },
};
</script>

<style scoped>
.homepage {
  padding: 2rem;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.loading, .error-message {
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: red;
}
</style>
