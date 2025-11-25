import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', {
  state: () => ({
    token: null,
    user: null,
  }),
  actions: {
    setToken(token) {
      this.token = token;
    },
    clearToken() {
      this.token = null;
    },
    setUser(user) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    },
  },
  persist: true,
});
