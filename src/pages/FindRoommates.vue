<template>
  <main class="homepage">
    <section class="hero">
      <h2>Find Your Perfect Roommate</h2>
      <p>Browse roommate postings or create your own</p>
      <button @click="openModal" class="create-btn">
        + Create New Posting
      </button>
    </section>

    <section class="listings-section">
      <div v-if="isLoading" class="loading">Loading roommate postings...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="postings.length === 0" class="no-listings">
        No roommate postings yet. Be the first to create one!
      </div>
      <div v-else class="listings-grid">
        <div
          v-for="posting in sortedPostings"
          :key="posting._id"
          class="listing-card"
        >
          <div class="listing-header">
            <h3>{{ posting.city }}</h3>
            <button
              @click="toggleSavedItem(posting._id)"
              class="favorite-btn"
              :class="{ 'is-saved': isSaved(posting._id) }"
              :title="
                isSaved(posting._id)
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              "
            >
              <span v-if="isSaved(posting._id)">♥</span>
              <span v-else>♡</span>
            </button>
          </div>

          <div class="listing-details">
            <p class="info">
              <strong>👤</strong> {{ posting.gender }}, {{ posting.age }} years
              old
            </p>
            <p v-if="posting.startDate && posting.endDate" class="dates">
              <strong>📅</strong> {{ formatDate(posting.startDate) }} -
              {{ formatDate(posting.endDate) }}
            </p>
            <p class="description">{{ posting.description }}</p>
            <button
              v-if="!isPoster(posting)"
              @click="contactPoster(posting._id)"
              class="contact-btn"
              :disabled="isContacting[posting._id]"
            >
              {{ isContacting[posting._id] ? "Sending..." : "Contact Me" }}
            </button>
          </div>

          <div v-if="isPoster(posting)" class="listing-actions">
            <button @click="deletePosting(posting._id)" class="delete-btn">
              Delete
            </button>
          </div>
          <!-- Debug: Always show if isPoster check -->
          <div
            v-if="false"
            style="background: yellow; padding: 10px; margin-top: 10px"
          >
            <strong>DEBUG:</strong> isPoster(posting) = {{ isPoster(posting)
            }}<br />
            Posting Poster: {{ posting.poster }}<br />
            User ID: {{ sessionStore.user?.id }}<br />
            User Object: {{ JSON.stringify(sessionStore.user) }}
          </div>
        </div>
      </div>
    </section>

    <!-- Create Posting Modal -->
    <div v-if="modalVisible" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>Create Roommate Posting</h2>
        <form @submit.prevent="emitCreatePosting">
          <div class="form-group">
            <label for="city">City *</label>
            <input
              type="text"
              id="city"
              v-model="form.city"
              required
              placeholder="e.g., Cambridge"
            />
          </div>

          <div class="form-group">
            <label for="gender">Gender *</label>
            <select id="gender" v-model="form.gender" required>
              <option value="" disabled>Select your gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div class="form-group">
            <label for="age">Age *</label>
            <input
              type="number"
              id="age"
              v-model.number="form.age"
              required
              min="18"
              max="120"
              placeholder="e.g., 25"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                v-model="form.startDate"
                required
              />
            </div>

            <div class="form-group">
              <label for="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                v-model="form.endDate"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea
              id="description"
              v-model="form.description"
              required
              rows="4"
              placeholder="Tell others about yourself and what you're looking for..."
            ></textarea>
          </div>

          <div v-if="createError" class="error-message">{{ createError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn" :disabled="isCreating">
              {{ isCreating ? "Creating..." : "Create Posting" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useSessionStore } from "../stores/session.js";
import {
  roommatePostings,
  savedItems,
  userInfo as userInfoApi,
} from "../utils/api.js";

export default {
  name: "FindRoommates",
  setup() {
    const form = ref({
      city: "",
      gender: "",
      age: "",
      description: "",
      startDate: "",
      endDate: "",
    });
    const sessionStore = useSessionStore();
    const postings = ref([]);
    const savedItemIds = ref(new Set());
    const isLoading = ref(false);
    const error = ref("");
    const localModal = ref(false);
    const isCreating = ref(false);
    const createError = ref("");
    const isContacting = ref({}); // Track loading state per posting ID

    // Helper function to check if a string looks like a UUID (not a username)
    const isUUID = (str) => {
      if (!str || typeof str !== "string") return false;
      // UUID format: 8-4-4-4-12 hex digits
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        str
      );
    };

    // Fetch real user ID if current one looks like a username
    const ensureValidUserId = async () => {
      if (!sessionStore.token || !sessionStore.user) {
        console.log("[FindRoommates] No token or user, skipping user ID fetch");
        return false; // Return false if no update needed
      }

      const currentUserId = sessionStore.user?.id;
      if (!currentUserId || !isUUID(currentUserId)) {
        console.log(
          "[FindRoommates] User ID looks invalid (username?), fetching real ID:",
          currentUserId
        );
        try {
          const userInfoResult = await userInfoApi.getUserInfo();
          console.log("[FindRoommates] Fetched user info:", userInfoResult);
          if (
            userInfoResult &&
            userInfoResult.user &&
            isUUID(userInfoResult.user)
          ) {
            console.log(
              "[FindRoommates] Updating session store with real user ID:",
              userInfoResult.user
            );
            sessionStore.setUser({
              ...sessionStore.user,
              id: userInfoResult.user,
              age: userInfoResult.age,
              gender: userInfoResult.gender,
              affiliation: userInfoResult.affiliation,
              emailAddress: userInfoResult.emailAddress,
            });
            console.log(
              "[FindRoommates] Session store updated. New user ID:",
              sessionStore.user?.id
            );
            return true; // Return true if update happened
          }
        } catch (err) {
          console.error("[FindRoommates] Failed to fetch user info:", err);
        }
      } else {
        console.log(
          "[FindRoommates] User ID looks valid (UUID):",
          currentUserId
        );
      }
      return false; // Return false if no update needed
    };

    // Debug: Log session store state on setup
    console.log("[FindRoommates] Setup - Session Store State:", {
      hasToken: !!sessionStore.token,
      token: sessionStore.token,
      hasUser: !!sessionStore.user,
      user: sessionStore.user,
      userId: sessionStore.user?.id,
      userType: typeof sessionStore.user?.id,
    });

    const modalVisible = computed(() => localModal.value);

    const sortedPostings = computed(() => {
      return [...postings.value].sort((a, b) => {
        const cityA = (a.city || "").toLowerCase();
        const cityB = (b.city || "").toLowerCase();
        return cityA.localeCompare(cityB);
      });
    });

    const fetchPostings = async () => {
      isLoading.value = true;
      error.value = "";
      try {
        // Ensure user ID is valid before fetching
        const userIdUpdated = await ensureValidUserId();

        // If user ID was updated, wait a moment for reactivity
        if (userIdUpdated) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const result = await roommatePostings.getAll();
        console.log("[FindRoommates] Fetched postings:", result);
        console.log("[FindRoommates] Number of postings:", result?.length || 0);

        // Debug: Log each posting's poster ID
        if (result && Array.isArray(result)) {
          result.forEach((posting, index) => {
            console.log(`[FindRoommates] Posting ${index}:`, {
              _id: posting._id,
              city: posting.city,
              poster: posting.poster,
              posterType: typeof posting.poster,
            });
          });
        }

        postings.value = result || [];

        // Debug: After setting postings, check ownership
        console.log(
          "[FindRoommates] Current user ID from session:",
          sessionStore.user?.id
        );
        console.log(
          "[FindRoommates] User ID type:",
          typeof sessionStore.user?.id,
          "Is UUID:",
          sessionStore.user?.id && isUUID(sessionStore.user.id)
        );
        if (result && Array.isArray(result) && sessionStore.user?.id) {
          result.forEach((posting) => {
            const isPosterResult = isPoster(posting);
            console.log(
              `[FindRoommates] Posting "${posting.city}" (${posting._id}) isPoster:`,
              isPosterResult,
              "Poster ID:",
              posting.poster,
              "User ID:",
              sessionStore.user?.id
            );
          });
        }
      } catch (err) {
        console.error("Error fetching postings:", err);
        error.value = err.message || "Failed to load roommate postings";
      } finally {
        isLoading.value = false;
      }
    };

    const fetchSavedItems = async () => {
      if (!sessionStore.user || !sessionStore.user.id) {
        console.log("No user logged in, skipping fetchSavedItems");
        return;
      }

      try {
        console.log("Fetching saved items for user:", sessionStore.user.id);
        const result = await savedItems.getSavedItems(sessionStore.user.id);
        console.log("Raw saved items result:", result);
        const items = result?.results || result;
        console.log(
          "Items to process:",
          items,
          "Is array:",
          Array.isArray(items)
        );

        if (items && Array.isArray(items)) {
          // API might return nested structure: {item: {item: "id", tags: []}} or direct objects with _id
          const ids = items
            .map((saved) => {
              console.log(
                "Processing saved item:",
                JSON.stringify(saved, null, 2)
              );
              // API returns: {user: "...", savedItem: {item: "id", tags: [...]}}
              if (saved.savedItem && saved.savedItem.item) {
                console.log(
                  "Using saved.savedItem.item:",
                  saved.savedItem.item
                );
                return saved.savedItem.item;
              } else if (saved._id) {
                console.log("Using saved._id:", saved._id);
                return saved._id;
              } else if (saved.item && saved.item.item) {
                console.log("Using saved.item.item:", saved.item.item);
                return saved.item.item;
              }
              console.log("No ID found for this item");
              return null;
            })
            .filter((id) => id !== null);
          savedItemIds.value = new Set(ids);
          console.log("Saved item IDs set to:", Array.from(savedItemIds.value));
        } else {
          console.log("Result is not an array, clearing saved items");
          savedItemIds.value = new Set();
        }
      } catch (err) {
        console.error("Error fetching saved items:", err);
      }
    };

    const isSaved = (itemId) => {
      const saved = savedItemIds.value.has(itemId);
      console.log(
        `isSaved(${itemId}):`,
        saved,
        "Current saved IDs:",
        Array.from(savedItemIds.value)
      );
      return saved;
    };

    const toggleSavedItem = async (itemId) => {
      if (!sessionStore.user || !sessionStore.user.id) {
        alert("Please log in to save items");
        return;
      }

      const userId = sessionStore.user.id;
      console.log("toggleSavedItem called for:", itemId, "User:", userId);

      try {
        if (isSaved(itemId)) {
          // Remove from saved items
          console.log("Removing item from saved items via API");
          await savedItems.removeItem(userId, itemId);
          savedItemIds.value.delete(itemId);
          console.log("Removed from saved items:", itemId);
        } else {
          // Add to saved items with "Favorite" tag
          console.log("Adding item to saved items via API");
          await savedItems.addTag(userId, itemId, "Favorite");
          savedItemIds.value.add(itemId);
          console.log(
            "Added to saved items:",
            itemId,
            "Updated set:",
            Array.from(savedItemIds.value)
          );
        }
      } catch (err) {
        console.error("Error toggling saved item:", err);
        alert(
          "Failed to update favorites: " + (err.message || "Unknown error")
        );
      }
    };

    const openModal = () => {
      localModal.value = true;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const closeModal = () => {
      localModal.value = false;
      createError.value = "";
    };

    const isPoster = (posting) => {
      console.log("[FindRoommates] isPoster called for posting:", {
        postingId: posting._id,
        postingCity: posting.city,
        postingPoster: posting.poster,
        postingPosterType: typeof posting.poster,
      });

      console.log("[FindRoommates] Session store user:", {
        hasUser: !!sessionStore.user,
        user: sessionStore.user,
        userId: sessionStore.user?.id,
        userIdType: typeof sessionStore.user?.id,
        userUser: sessionStore.user?.user,
      });

      if (!sessionStore.user || !sessionStore.user.id) {
        console.log(
          "[FindRoommates] isPoster: No user in session store - returning false"
        );
        return false;
      }

      const userId = sessionStore.user.id || sessionStore.user.user;
      console.log("[FindRoommates] Comparing IDs:", {
        postingPoster: posting.poster,
        postingPosterType: typeof posting.poster,
        userId: userId,
        userIdType: typeof userId,
        areEqual: posting.poster === userId,
        strictEqual: posting.poster === userId,
      });

      const isPosterResult = posting.poster === userId;
      console.log("[FindRoommates] isPoster result:", isPosterResult);

      return isPosterResult;
    };

    const deletePosting = async (postingId) => {
      if (!confirm("Are you sure you want to delete this roommate posting?")) {
        return;
      }

      try {
        await roommatePostings.delete(postingId);
        await fetchPostings();
        alert("Posting deleted successfully");
      } catch (err) {
        console.error("Error deleting posting:", err);
        alert("Failed to delete posting: " + (err.message || "Unknown error"));
      }
    };

    const contactPoster = async (postingId) => {
      if (!sessionStore.user || !sessionStore.user.id) {
        alert("Please log in to contact posters");
        return;
      }

      // Set loading state for this specific posting
      isContacting.value[postingId] = true;

      try {
        console.log("Contacting poster for posting:", postingId);
        const result = await roommatePostings.contact(postingId);
        console.log("Contact sent successfully:", result);
        alert("Your interest has been sent to the posting owner!");

        // Refetch saved items to update local state
        await fetchSavedItems();
      } catch (err) {
        console.error("Error contacting poster:", err);
        alert(
          "Failed to send contact request: " + (err.message || "Unknown error")
        );
      } finally {
        // Clear loading state for this specific posting
        isContacting.value[postingId] = false;
      }
    };

    const emitCreatePosting = async () => {
      isCreating.value = true;
      createError.value = "";

      try {
        console.log("Creating roommate posting with data:", form.value);

        const postingData = {
          city: form.value.city,
          gender: form.value.gender,
          age: form.value.age,
          description: form.value.description,
          startDate: form.value.startDate,
          endDate: form.value.endDate,
        };

        const result = await roommatePostings.create(postingData);
        console.log("Posting created successfully:", result);

        // Clear form and close modal
        form.value = {
          city: "",
          gender: "",
          age: "",
          description: "",
          startDate: "",
          endDate: "",
        };
        closeModal();

        // Refresh postings
        await fetchPostings();
      } catch (err) {
        console.error("Error creating posting:", err);
        createError.value = err.message || "Failed to create posting";
      } finally {
        isCreating.value = false;
      }
    };

    const route = useRoute();

    onMounted(async () => {
      console.log("[FindRoommates] Component mounted");
      console.log("[FindRoommates] Session store on mount:", {
        token: sessionStore.token,
        user: sessionStore.user,
        userId: sessionStore.user?.id,
      });

      // Ensure we have a valid user ID before fetching postings
      await ensureValidUserId();

      fetchPostings();
      fetchSavedItems();
    });

    // Watch for route changes to refetch saved items when returning to this page
    watch(
      () => route.path,
      (newPath) => {
        if (newPath === "/find-roommates") {
          console.log("Navigated to Find Roommates - refetching saved items");
          fetchSavedItems();
        }
      }
    );

    return {
      form,
      sessionStore,
      postings,
      sortedPostings,
      isLoading,
      error,
      isCreating,
      createError,
      emitCreatePosting,
      openModal,
      closeModal,
      modalVisible,
      isSaved,
      toggleSavedItem,
      contactPoster,
      isContacting,
      isPoster,
      deletePosting,
      formatDate,
    };
  },
};
</script>

<style scoped>
.homepage {
  flex: 1;
  width: 100%;
  min-height: calc(100vh - 60px);
}

.hero {
  background: linear-gradient(135deg, #123619 0%, #1e5a2e 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: white;
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.create-btn {
  background: white;
  color: #123619;
  border: none;
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.listings-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.loading,
.no-listings {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.listing-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.listing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.listing-header h3 {
  color: #123619;
  font-size: 1.4rem;
  margin: 0;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
  line-height: 1;
}

.favorite-btn.is-saved {
  color: #dc3545;
}

.favorite-btn:hover {
  transform: scale(1.15);
}

.listing-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info,
.dates {
  color: #555;
  font-size: 1rem;
  line-height: 1.6;
}

.description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-top: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.contact-btn {
  width: 100%;
  background: #1e5a2e;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s, opacity 0.2s;
}

.contact-btn:hover:not(:disabled) {
  background: #123619;
}

.contact-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.listing-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.delete-btn {
  flex: 1;
  padding: 0.625rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  opacity: 0.85;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  color: #123619;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #123619;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1e5a2e;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 6px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.submit-btn {
  background: #1e5a2e;
  color: white;
}

.cancel-btn:hover,
.submit-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }

  .hero h2 {
    font-size: 2rem;
  }
}
</style>
