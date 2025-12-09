<template>
  <main class="homepage">
    <section class="hero">
      <h2>Interested</h2>
      <p>All your favorites & contacted</p>
      <div class="button-spacer"></div>
    </section>

    <!-- Tab Navigation -->
    <section class="tabs-section">
      <div class="tabs-container">
        <button
          @click="activeTab = 'housing'"
          class="tab-btn"
          :class="{ active: activeTab === 'housing' }"
        >
          Housing Listings
        </button>
        <button
          @click="activeTab = 'roommates'"
          class="tab-btn"
          :class="{ active: activeTab === 'roommates' }"
        >
          Roommate Postings
        </button>
      </div>
    </section>

    <section class="listings-section">
      <div v-if="isLoading" class="loading">Loading your favorites...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="savedItems.length === 0" class="no-listings">
        No favorites yet. Start exploring and save items you like!
      </div>
      <div v-else>
        <!-- Housing Tab Content -->
        <div v-show="activeTab === 'housing'" class="tab-content">
          <div v-if="housingListings.length === 0" class="no-listings">
            No housing favorites yet. Start exploring housing listings!
          </div>

          <!-- Housing -->
          <div v-if="housingListings.length > 0" class="section listings-container">
            <div class="listings-grid">
            <div
              v-for="listing in housingListings"
              :key="listing._id"
              class="posting-card"
              :class="{ 'expanded': expandedListing === listing._id }"
              @click="toggleListingDetails(listing._id)"
            >
              <div class="card-header">
                <div class="card-title">
                <h3>{{ listing.title }}</h3>
                  <div class="quick-info">
                    <span class="address-preview">
                      <svg class="info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {{ listing.address }}
                    </span>
                    <span class="price-preview">
                      <svg class="info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(22, 53, 27)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      {{ listing.price }}/month
                    </span>
                  </div>
                </div>

                <div class="card-actions" @click.stop>
                <button
                  @click="removeFavorite(listing._id)"
                    class="favorite-btn is-saved"
                  title="Remove from favorites"
                >
                  <span class="heart-icon">❤</span>
                </button>
                  <div v-if="isOwner(listing)" class="owner-badge">
                    Your Listing
                  </div>
                </div>
              </div>

              <div class="card-preview">
                <div class="listing-summary">
                  <span class="dates-preview">
                    <svg class="info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {{ formatDate(listing.startDate) }} - {{ formatDate(listing.endDate) }}
                  </span>
                  <span class="type-preview">{{ listing.type === "sublet" ? "Sublet" : "Renting" }}</span>
                </div>

                <!-- Photo Preview -->
                <div v-if="listing.photos && listing.photos.length > 0" class="card-photos">
                  <div
                    v-for="(photo, index) in listing.photos.slice(0, 2)"
                    :key="index"
                    class="card-photo-item"
                  >
                    <img
                      :src="getPhotoUrl(photo)"
                      :alt="listing.title + ' photo ' + (index + 1)"
                      class="card-photo-main"
                    />
                  </div>
                  <div v-if="listing.photos.length > 2" class="photo-count-badge">
                    +{{ listing.photos.length - 2 }} more
                  </div>
                </div>

                <p class="description-preview" v-if="listing.description && listing.description.trim()">
                  {{ truncateText(listing.description, 100) }}
                </p>
                <div class="tags" v-if="getItemTags(listing._id).filter(tag => tag !== 'Favorite').length > 0">
                  <span v-for="tag in getItemTags(listing._id).filter(tag => tag !== 'Favorite')" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                </div>
                <div class="expand-hint">
                  <span>Click for details</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <!-- Roommate Tab Content -->
        <div v-show="activeTab === 'roommates'" class="tab-content">
          <div v-if="roommatePostings.length === 0" class="no-listings">
            No roommate favorites yet. Start exploring roommate postings!
          </div>

          <!-- Roommate Postings -->
          <div v-if="roommatePostings.length > 0" class="listings-container">
            <div class="listings-grid">
              <div
                v-for="posting in roommatePostings"
                :key="posting._id"
                class="posting-card"
                :class="{ 'expanded': expandedPosting === posting._id }"
                @click="togglePostingDetails(posting._id)"
              >
                <div class="card-header">
                  <div class="card-title">
                  <h3>{{ posting.city }}</h3>
                    <div class="quick-info">
                      <span class="age-gender">
                        <svg class="info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        {{ posting.gender }}, {{ posting.age }}
                      </span>
                      <div class="tags-row">
                        <span v-if="posting.numberOfRoommates" class="roommate-count">
                          {{ posting.numberOfRoommates }} roommate{{ posting.numberOfRoommates > 1 ? 's' : '' }}
                        </span>
                        <span v-if="posting.housingStatus === 'Found housing'" class="housing-status-badge">
                          Found housing
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="card-actions" @click.stop>
                  <button
                    @click="removeFavorite(posting._id)"
                      class="favorite-btn is-saved"
                    title="Remove from favorites"
                  >
                    <span class="heart-icon">❤</span>
                  </button>
                    <div v-if="isPoster(posting)" class="owner-badge">
                      Your Posting
                    </div>
                  </div>
                </div>

                <div class="card-preview">
                  <p class="description-preview">{{ truncateText(posting.aboutYourself || posting.description || "", 100) }}</p>
                  <div class="tags" v-if="getItemTags(posting._id).filter(tag => tag !== 'Favorite').length > 0">
                    <span v-for="tag in getItemTags(posting._id).filter(tag => tag !== 'Favorite')" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                  </div>
                  <div class="expand-hint">
                    <span>Click for details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded Roommate Detail Modal -->
        <div v-if="expandedPosting" class="detail-overlay" @click="closeDetails">
          <div class="detail-panel" @click.stop>
            <div class="detail-header">
              <h2>{{ getExpandedPosting().city }}</h2>
              <button @click="closeDetails" class="close-btn">×</button>
            </div>

            <div class="detail-content">
              <!-- Personal Information Table -->
              <div class="info-section">
                <h3>Personal Information</h3>
                <table class="info-table">
                  <tbody>
                    <tr>
                      <td>Profile</td>
                      <td>{{ getExpandedPosting().gender }}, {{ getExpandedPosting().age }} years old</td>
                    </tr>
                    <tr v-if="getExpandedPosting().numberOfRoommates">
                      <td>Looking for</td>
                      <td>{{ getExpandedPosting().numberOfRoommates }} roommate{{ getExpandedPosting().numberOfRoommates > 1 ? 's' : '' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Dates & Timeline -->
              <div class="info-section" v-if="getExpandedPosting().startDate || getExpandedPosting().endDate">
                <h3>Timeline</h3>
                <table class="info-table">
                  <tbody>
                    <tr v-if="getExpandedPosting().startDate && getExpandedPosting().endDate">
                      <td>Duration</td>
                      <td>{{ formatDate(getExpandedPosting().startDate) }} - {{ formatDate(getExpandedPosting().endDate) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Lifestyle Preferences -->
              <div class="info-section">
                <h3>Lifestyle & Preferences</h3>
                <table class="info-table">
                  <tbody>
                    <tr v-if="getExpandedPosting().dailyRhythm">
                      <td>Daily Rhythm</td>
                      <td>{{ getExpandedPosting().dailyRhythm }}</td>
                    </tr>
                    <tr v-if="getExpandedPosting().cleanlinessPreference">
                      <td>Cleanliness</td>
                      <td>{{ getExpandedPosting().cleanlinessPreference }}</td>
                    </tr>
                    <tr v-if="getExpandedPosting().homeEnvironment">
                      <td>Home Environment</td>
                      <td>{{ getExpandedPosting().homeEnvironment }}</td>
                    </tr>
                    <tr v-if="getExpandedPosting().guestsVisitors">
                      <td>Guests & Visitors</td>
                      <td>{{ getExpandedPosting().guestsVisitors }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Description (old format) -->
              <div class="info-section" v-if="getExpandedPosting().description && !getExpandedPosting().aboutYourself && !getExpandedPosting().lookingFor">
                <h3>About</h3>
                <div class="description-full">
                  {{ getExpandedPosting().description }}
                </div>
              </div>

              <!-- About Yourself (new format) -->
              <div class="info-section" v-if="getExpandedPosting().aboutYourself">
                <h3>About This Person</h3>
                <div class="description-full">
                  {{ getExpandedPosting().aboutYourself }}
                </div>
              </div>

              <!-- Looking For (new format) -->
              <div class="info-section" v-if="getExpandedPosting().lookingFor">
                <h3>What They're Looking For</h3>
                <div class="description-full">
                  {{ getExpandedPosting().lookingFor }}
                </div>
              </div>

              <!-- Tags -->
              <div class="info-section" v-if="getItemTags(getExpandedPosting()._id).filter(tag => tag !== 'Favorite').length > 0">
                <h3>Status</h3>
                <div class="tags">
                  <span v-for="tag in getItemTags(getExpandedPosting()._id).filter(tag => tag !== 'Favorite')" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="detail-actions">
              <div v-if="!isPoster(getExpandedPosting())" class="action-buttons-grid">
                <div class="favorited-message">
                  Already favorited
                </div>

                <button
                  v-if="!getItemTags(getExpandedPosting()._id).includes('Contacted')"
                  @click="contactPoster(getExpandedPosting()._id)"
                  class="contact-btn"
                  :disabled="isContacting[getExpandedPosting()._id]"
                >
                  <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>{{ isContacting[getExpandedPosting()._id] ? "Contacting..." : "Contact" }}</span>
                </button>

                <div v-if="getItemTags(getExpandedPosting()._id).includes('Contacted')" class="contacted-message">
                  Already contacted
                </div>
              </div>

              <div v-if="isPoster(getExpandedPosting())" class="owner-message">
                This is your own posting
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded Housing Detail Modal -->
        <div v-if="expandedListing" class="detail-overlay" @click="closeListing">
          <div class="detail-panel" @click.stop>
            <div class="detail-header">
              <h2>{{ getExpandedListing().title }}</h2>
              <button @click="closeListing" class="close-btn">×</button>
            </div>

            <div class="detail-content">
              <!-- Photo Gallery Section -->
              <div class="info-section" v-if="getExpandedListing().photos && getExpandedListing().photos.length > 0">
                <h3>Photos</h3>
                <div class="photo-gallery">
                  <div
                    v-for="(photo, index) in getExpandedListing().photos"
                    :key="index"
                    class="photo-item"
                  >
                    <img :src="getPhotoUrl(photo)" :alt="'Photo ' + (index + 1)" class="photo-preview" />
                  </div>
                </div>
              </div>

              <!-- Property Information -->
              <div class="info-section">
                <h3>Property Information</h3>
                <table class="info-table">
                  <tbody>
                    <tr>
                      <td>Address</td>
                      <td>{{ getExpandedListing().address }}</td>
                    </tr>
                    <tr>
                      <td>Type</td>
                      <td>{{ getExpandedListing().type === "sublet" ? "Sublet" : "Renting" }}</td>
                    </tr>
                    <tr>
                      <td>Price</td>
                      <td>${{ getExpandedListing().price }}/month</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Availability -->
              <div class="info-section">
                <h3>Availability</h3>
                <table class="info-table">
                  <tbody>
                    <tr>
                      <td>Duration</td>
                      <td>{{ formatDate(getExpandedListing().startDate) }} - {{ formatDate(getExpandedListing().endDate) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Description -->
              <div class="info-section" v-if="getExpandedListing().description && getExpandedListing().description.trim()">
                <h3>About This Property</h3>
                <div class="description-full">
                  {{ getExpandedListing().description }}
                </div>
              </div>

              <!-- Amenities -->
              <div class="info-section" v-if="getExpandedListing().amenities && getExpandedListing().amenities.length > 0">
                <h3>Amenities</h3>
                <table class="info-table">
                  <tbody>
                    <tr v-for="amenity in getExpandedListing().amenities" :key="amenity._id">
                      <td>{{ amenity.title }}</td>
                      <td>{{ amenity.distance && amenity.distance > 0 ? `${amenity.distance} miles` : 'On-site' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Tags -->
              <div class="info-section" v-if="getItemTags(getExpandedListing()._id).filter(tag => tag !== 'Favorite').length > 0">
                <h3>Status</h3>
                <div class="tags">
                  <span v-for="tag in getItemTags(getExpandedListing()._id).filter(tag => tag !== 'Favorite')" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="detail-actions">
              <div v-if="!isOwner(getExpandedListing())" class="action-buttons-grid">
                <div class="favorited-message">
                  Already favorited
                </div>

                <button
                  v-if="!getItemTags(getExpandedListing()._id).includes('Contacted')"
                  @click="sendInterest(getExpandedListing()._id)"
                  class="contact-btn"
                  :disabled="isSendingInterest[getExpandedListing()._id]"
                >
                  <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>{{ isSendingInterest[getExpandedListing()._id] ? "Contacting..." : "Contact" }}</span>
                </button>

                <div v-if="getItemTags(getExpandedListing()._id).includes('Contacted')" class="contacted-message">
                  Already contacted
                </div>
              </div>

              <div v-if="isOwner(getExpandedListing())" class="owner-message">
                This is your own listing
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useSessionStore } from "../stores/session.js";
import {
  savedItems as savedItemsApi,
  roommatePostings as roommatePostingsApi,
  listings as listingsApi,
} from "../utils/api.js";

console.log("savedItemsApi:", savedItemsApi);
console.log("savedItemsApi.getSavedItems:", savedItemsApi?.getSavedItems);

export default {
  name: "Favorites",
  setup() {
    const sessionStore = useSessionStore();
    const activeTab = ref('housing');
    const savedItems_data = ref([]);
    const savedItemsMap = ref(new Map()); // Map of itemId -> {tags: []}
    const allRoommatePostings = ref([]);
    const allHousingListings = ref([]);
    const isLoading = ref(false);
    const error = ref("");
    const isContacting = ref({}); // Track loading state per posting ID
    const isSendingInterest = ref({}); // Track loading state per listing ID

    // New data for expanded view
    const expandedPosting = ref(null);
    const expandedListing = ref(null);

    const savedItems = computed(() => {
      return savedItems_data.value;
    });

    const roommatePostings = computed(() => {
      // Filter saved items that are roommate postings (have 'city' field)
      // Exclude posts that the user owns
      const userId = sessionStore.user?.id || sessionStore.user?.user;
      return savedItems_data.value
        .filter((item) => item.city !== undefined && item.poster !== userId)
        .sort((a, b) => b._id.localeCompare(a._id)); // Sort by most recent first
    });

    const housingListings = computed(() => {
      // Filter saved items that are housing listings (have 'title' and 'address' fields)
      // Exclude listings that the user owns
      const userId = sessionStore.user?.id || sessionStore.user?.user;
      return savedItems_data.value.filter(
        (item) => item.title !== undefined && item.address !== undefined && item.lister !== userId
      );
    });

    const getItemTags = (itemId) => {
      const savedItem = savedItemsMap.value.get(itemId);
      const tags = savedItem && savedItem.tags ? savedItem.tags : [];
      console.log(
        `getItemTags(${itemId}):`,
        tags,
        "savedItemsMap:",
        Array.from(savedItemsMap.value.entries())
      );
      return tags;
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    // New methods for expanded view
    const togglePostingDetails = (postingId) => {
      if (expandedPosting.value === postingId) {
        expandedPosting.value = null;
      } else {
        expandedPosting.value = postingId;
        expandedListing.value = null; // Close listing if open
      }
    };

    const toggleListingDetails = (listingId) => {
      if (expandedListing.value === listingId) {
        expandedListing.value = null;
      } else {
        expandedListing.value = listingId;
        expandedPosting.value = null; // Close posting if open
      }
    };

    const closeDetails = () => {
      expandedPosting.value = null;
    };

    const closeListing = () => {
      expandedListing.value = null;
    };

    const getExpandedPosting = () => {
      return roommatePostings.value.find(p => p._id === expandedPosting.value) || {};
    };

    const getExpandedListing = () => {
      return housingListings.value.find(l => l._id === expandedListing.value) || {};
    };

    const truncateText = (text, maxLength) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    const getPhotoUrl = (photo) => {
      if (!photo) return '';
      // Handle both old format (string) and new format (object with url property)
      return typeof photo === 'string' ? photo : photo.url || photo.thumbUrl || '';
    };

    const isOwner = (listing) => {
      console.log("[Favorites] isOwner called for listing:", {
        listingId: listing._id,
        listingTitle: listing.title,
        listingLister: listing.lister,
        listingListerType: typeof listing.lister,
      });

      console.log("[Favorites] Session store user:", {
        hasUser: !!sessionStore.user,
        user: sessionStore.user,
        userId: sessionStore.user?.id,
        userIdType: typeof sessionStore.user?.id,
      });

      if (!sessionStore.user || !sessionStore.user.id) {
        console.log("[Favorites] isOwner: No user in session store - returning false");
        return false;
      }

      const userId = sessionStore.user.id || sessionStore.user.user;
      console.log("[Favorites] Comparing IDs:", {
        listingLister: listing.lister,
        listingListerType: typeof listing.lister,
        userId: userId,
        userIdType: typeof userId,
        areEqual: listing.lister === userId,
      });

      const isOwnerResult = listing.lister === userId;
      console.log("[Favorites] isOwner result:", isOwnerResult);

      return isOwnerResult;
    };

    const isPoster = (posting) => {
      console.log("[Favorites] isPoster called for posting:", {
        postingId: posting._id,
        postingCity: posting.city,
        postingPoster: posting.poster,
        postingPosterType: typeof posting.poster,
      });

      console.log("[Favorites] Session store user:", {
        hasUser: !!sessionStore.user,
        user: sessionStore.user,
        userId: sessionStore.user?.id,
        userIdType: typeof sessionStore.user?.id,
      });

      if (!sessionStore.user || !sessionStore.user.id) {
        console.log("[Favorites] isPoster: No user in session store - returning false");
        return false;
      }

      const userId = sessionStore.user.id || sessionStore.user.user;
      console.log("[Favorites] Comparing IDs:", {
        postingPoster: posting.poster,
        postingPosterType: typeof posting.poster,
        userId: userId,
        userIdType: typeof userId,
        areEqual: posting.poster === userId,
      });

      const isPosterResult = posting.poster === userId;
      console.log("[Favorites] isPoster result:", isPosterResult);

      return isPosterResult;
    };

    const fetchSavedItems = async () => {
      console.log("Starting fetchSavedItems, user:", sessionStore.user);
      console.log("Session store:", sessionStore);
      console.log("User ID:", sessionStore.user?.id);
      console.log("Session token:", sessionStore.token);

      if (!sessionStore.user || !sessionStore.user.id) {
        error.value = "Please log in to view your favorites";
        isLoading.value = false;
        return;
      }

      isLoading.value = true;
      error.value = "";

      try {
        console.log("Calling savedItemsApi.getSavedItems with userId:", sessionStore.user.id);

        // First, let's try to fetch listings to see if the backend is working at all
        console.log("Testing if backend is reachable by fetching listings...");
        const testTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Backend test timeout")), 3000);
        });

        try {
          const testResult = await Promise.race([
            listingsApi.getAll(),
            testTimeout
          ]);
          console.log("Backend test successful, got", testResult?.length || 0, "listings");
        } catch (testErr) {
          console.error("Backend test failed:", testErr);
          throw new Error("Backend server is not responding. Please make sure the backend is running.");
        }

        // Add a shorter timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("SavedItems API timeout - this endpoint may have issues")), 5000);
        });

        const result = await Promise.race([
          savedItemsApi.getSavedItems(sessionStore.user.id),
          timeoutPromise
        ]);
        console.log("Fetched saved items raw result:", result);

        // API returns {results: [...]} structure where each item is {user: "...", savedItem: {item: "id", tags: [...]}}
        const items = result?.results || result;
        console.log(
          "Items to process:",
          items,
          "Is array:",
          Array.isArray(items)
        );

        if (!Array.isArray(items)) {
          console.log("No items or invalid format, setting empty array");
          savedItems_data.value = [];
          savedItemsMap.value = new Map();
          return;
        }

        // Extract item IDs and build tags map
        const itemIds = [];
        const tagsMap = new Map();

        items.forEach((saved) => {
          console.log(
            "Processing saved item structure:",
            JSON.stringify(saved, null, 2)
          );
          if (saved.savedItem && saved.savedItem.item) {
            const itemId = saved.savedItem.item;
            const tags = saved.savedItem.tags || [];
            console.log(`Found itemId: ${itemId}, tags:`, tags);

            // Add itemId if not already in the list
            if (!itemIds.includes(itemId)) {
              itemIds.push(itemId);
            }

            // Merge tags if item already exists in map
            if (tagsMap.has(itemId)) {
              const existingTags = tagsMap.get(itemId).tags;
              const mergedTags = [...new Set([...existingTags, ...tags])];
              tagsMap.set(itemId, { tags: mergedTags });
              console.log(`Merged tags for ${itemId}:`, mergedTags);
            } else {
              tagsMap.set(itemId, { tags: tags });
            }
          } else {
            console.log("Saved item does not have expected structure");
          }
        });

        savedItemsMap.value = tagsMap;
        console.log("Extracted item IDs:", itemIds);
        console.log("Tags map:", Array.from(tagsMap.entries()));

        // Fetch the actual postings using the IDs
        // For now, fetch all postings and filter by IDs
        console.log("Fetching roommate postings and housing listings...");
        const [roommates, housing] = await Promise.all([
          roommatePostingsApi.getAll().catch(err => {
            console.error("Error fetching roommate postings:", err);
            return [];
          }),
          listingsApi.getAll().catch(err => {
            console.error("Error fetching housing listings:", err);
            return [];
          }),
        ]);

        console.log("Roommate postings fetched:", roommates?.length || 0);
        console.log("Housing listings fetched:", housing?.length || 0);

        const allPostings = [...(roommates || []), ...(housing || [])];
        console.log("All postings:", allPostings);

        // Filter to show items that are either favorited OR contacted
        // An item should be shown if it has any tag (Favorite, Contacted, etc.)
        savedItems_data.value = allPostings.filter((posting) =>
          itemIds.includes(posting._id)
        );
        console.log("Filtered saved items:", savedItems_data.value);
      } catch (err) {
        console.error("Error fetching saved items:", err);
        error.value = err.message || "Failed to load favorites";
        // Set empty arrays so the page doesn't stay loading forever
        savedItems_data.value = [];
        savedItemsMap.value = new Map();
      } finally {
        isLoading.value = false;
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
        const result = await roommatePostingsApi.contact(postingId);
        console.log("Contact sent successfully:", result);
        alert("Your interest has been sent to the posting owner!");

        // Wait a moment for backend to process, then refetch saved items
        await new Promise((resolve) => setTimeout(resolve, 500));
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

    const sendInterest = async (listingId) => {
      if (!sessionStore.user || !sessionStore.user.id) {
        alert("Please log in to contact");
        return;
      }

      // Set loading state for this specific listing
      isSendingInterest.value[listingId] = true;

      try {
        console.log("Sending interest for listing:", listingId);
        const result = await listingsApi.sendInterest(listingId);
        console.log("Interest sent successfully:", result);
        alert("Your interest has been sent to the listing owner!");

        // Wait a moment for backend to process, then refetch saved items
        await new Promise((resolve) => setTimeout(resolve, 500));
        await fetchSavedItems();
      } catch (err) {
        console.error("Error sending interest:", err);
        alert("Failed to contact: " + (err.message || "Unknown error"));
      } finally {
        // Clear loading state for this specific listing
        isSendingInterest.value[listingId] = false;
      }
    };

    const removeFavorite = async (itemId) => {
      if (!sessionStore.user || !sessionStore.user.id) {
        alert("Please log in");
        return;
      }

      try {
        await savedItemsApi.removeItem(sessionStore.user.id, itemId);
        // Remove from local state
        savedItems_data.value = savedItems_data.value.filter(
          (item) => item._id !== itemId
        );
        console.log("Removed favorite:", itemId);
      } catch (err) {
        console.error("Error removing favorite:", err);
        alert("Failed to remove favorite: " + (err.message || "Unknown error"));
      }
    };

    onMounted(async () => {
      await fetchSavedItems();
    });

    return {
      activeTab,
      savedItems,
      roommatePostings,
      housingListings,
      isLoading,
      error,
      getItemTags,
      formatDate,
      removeFavorite,
      contactPoster,
      isContacting,
      sendInterest,
      isSendingInterest,
      expandedPosting,
      expandedListing,
      togglePostingDetails,
      toggleListingDetails,
      closeDetails,
      closeListing,
      getExpandedPosting,
      getExpandedListing,
      truncateText,
      getPhotoUrl,
      isOwner,
      isPoster,
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
  background-color: rgb(47, 71, 62);
  background-image: url('../assets/scene.png');
  background-size: cover;
  background-position: center bottom;
  color: white;
  padding: 2rem 2rem;
  text-align: center;
  position: relative;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: white;
}

.hero p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

.button-spacer {
  height: 3.25rem;
  margin-bottom: 0;
}

.listings-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 2rem;
}

.section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.6rem;
  color: rgb(47, 71, 62);
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid rgb(47, 71, 62);
}

.title-with-icon {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.heart-emoji {
  font-size: 1.4rem;
  line-height: 1;
  display: inline-block;
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
  text-align: center;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
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
  color: rgb(47, 71, 62);
  font-size: 1.25rem;
  margin: 0;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 2.2rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn .heart-icon {
  color: #e74c3c;
  -webkit-text-stroke: 1.5px #e74c3c;
  -webkit-text-fill-color: #e74c3c;
  transition: all 0.2s;
  font-size: 2.2rem;
  font-weight: 300;
  letter-spacing: -0.1em;
  transform: scaleX(0.85);
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
.address,
.dates,
.price {
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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background: rgb(47, 71, 62);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.tag-contacted {
  background: #e7e6b5;
  color: #5c6d43;
}

.contact-btn,
.interest-btn {
  width: 100%;
  background: rgb(22, 53, 27);
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

.contact-btn:hover:not(:disabled),
.interest-btn:hover:not(:disabled) {
  background: rgb(15, 38, 19);
}

.contact-btn:disabled,
.interest-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.favorited-message,
.contacted-message {
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  color: #666;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.owner-message {
  padding: 0.75rem 1.5rem;
  background: rgb(47, 71, 62);
  color: white;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
}

/* New Compact Card Design */
.listings-container {
  position: relative;
}

.posting-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.posting-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #1e5a2e;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem 1.25rem 0.75rem;
}

.card-title h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e5a2e;
  margin: 0 0 0.5rem 0;
}

.quick-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.age-gender {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.address-preview {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.info-icon {
  color: #888;
  flex-shrink: 0;
}

.tags-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.roommate-count, .housing-status-badge {
  font-size: 0.85rem;
  color: #1e5a2e;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  background: #e8f5e9;
  border-radius: 4px;
}

.price-preview {
  font-size: 0.85rem;
  color: #1e5a2e;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.card-preview {
  padding: 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.description-preview {
  color: #666;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
}

.listing-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
}

.dates-preview {
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.type-preview {
  font-size: 0.85rem;
  color: #1e5a2e;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  background: #e8f5e9;
  border-radius: 4px;
}

.expand-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #1e5a2e;
  font-weight: 500;
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
  margin-top: auto;
}

.expand-icon {
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.posting-card:hover .expand-icon {
  transform: scale(1.2);
}

/* Detail Overlay Modal */
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.detail-panel {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f8f9fa;
  background: rgb(47, 71, 62);
  color: white;
  border-radius: 16px 16px 0 0;
}

.detail-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: white;
  padding: 0.25rem;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.detail-content {
  padding: 2rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h3 {
  color: #1e5a2e;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table tr {
  border-bottom: 1px solid #f8f9fa;
}

.info-table tr:last-child {
  border-bottom: none;
}

.info-table td {
  padding: 0.75rem 0;
  vertical-align: top;
}

.info-table td:first-child {
  font-weight: 600;
  color: #555;
  width: 35%;
}

.info-table td:last-child {
  color: #333;
  padding-left: 1rem;
}

.description-full {
  background: #f8f9fa;
  padding: 1.25rem;
  border-radius: 8px;
  line-height: 1.6;
  color: #555;
  border-left: 4px solid #1e5a2e;
}

.detail-actions {
  padding: 1.5rem 2rem;
  border-top: 2px solid #f8f9fa;
  background: #fafafa;
  border-radius: 0 0 16px 16px;
}

.action-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.favorite-action-btn,
.contact-btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgb(22, 53, 27);
  color: white;
}

.favorite-action-btn:hover,
.contact-btn:hover {
  background: rgb(15, 38, 19);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 53, 27, 0.3);
}

.favorite-action-btn:active,
.contact-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(22, 53, 27, 0.2);
}

.favorite-action-btn.favorited {
  background: rgb(22, 53, 27);
}

.btn-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Photo Display Styles */
.card-photos {
  position: relative;
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
}

.card-photo-item {
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.card-photo-main {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

.photo-count-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.photo-preview-section {
  position: relative;
  margin: 0 1.25rem 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.card-photo-preview {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

.photo-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.photo-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.photo-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.photo-item:hover {
  transform: scale(1.02);
}

.photo-preview {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
  cursor: pointer;
}

.owner-badge {
  background: rgb(47, 71, 62);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Tab Navigation Styles */
.tabs-section {
  background: transparent;
  border-bottom: none;
}

.tabs-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
  padding: 0 2rem;
}

.tab-btn {
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1.1rem;
  font-weight: 600;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 0 0 auto;
  width: auto;
}

.tab-btn:hover {
  background: rgba(30, 90, 46, 0.05);
  color: rgb(30, 90, 46);
}

.tab-btn.active {
  color: rgb(30, 90, 46);
  border-bottom-color: rgb(30, 90, 46);
  background: white;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }

  .hero h2 {
    font-size: 2rem;
  }

  .card-photo-preview {
    height: 160px;
  }

  .photo-gallery {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-overlay {
    padding: 1rem;
  }

  .detail-panel {
    max-height: 95vh;
  }

  .detail-content {
    padding: 1.5rem;
  }
}
</style>
