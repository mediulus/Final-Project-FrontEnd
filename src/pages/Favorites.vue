<template>
  <main class="homepage">
    <section class="hero">
      <h2>Your Favorites</h2>
      <p>All your saved properties and roommates</p>
    </section>

    <section class="listings-section">
      <div v-if="isLoading" class="loading">Loading your favorites...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="savedItems.length === 0" class="no-listings">
        No favorites yet. Start exploring and save items you like!
      </div>
      <div v-else>
        <!-- Roommate Postings -->
        <div v-if="roommatePostings.length > 0" class="listings-container">
          <h3 class="section-title">Roommate Postings</h3>
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
                    <span class="age-gender">{{ posting.gender }}, {{ posting.age }}</span>
                    <span v-if="posting.numberOfRoommates" class="roommate-count">
                      Looking for {{ posting.numberOfRoommates }} roommate{{ posting.numberOfRoommates > 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>
                
                <div class="card-actions" @click.stop>
                  <button
                    @click="removeFavorite(posting._id)"
                    class="favorite-btn is-saved"
                    title="Remove from favorites"
                  >
                    <span>♥</span>
                  </button>
                </div>
              </div>

              <div class="card-preview">
                <p class="description-preview">{{ truncateText(posting.description, 100) }}</p>
                <div class="tags" v-if="getItemTags(posting._id).length > 0">
                  <span v-for="tag in getItemTags(posting._id)" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                </div>
                <div class="expand-hint">
                  <span>{{ expandedPosting === posting._id ? 'Click to collapse' : 'Click for details' }}</span>
                  <span class="expand-icon">{{ expandedPosting === posting._id ? '▲' : '▼' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Housing Listings -->
        <div v-if="housingListings.length > 0" class="section listings-container">
          <h3 class="section-title">Housing Listings</h3>
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
                    <span class="address-preview">{{ listing.address }}</span>
                    <span class="price-preview">${{ listing.price }}/month</span>
                  </div>
                </div>
                
                <div class="card-actions" @click.stop>
                  <button
                    @click="removeFavorite(listing._id)"
                    class="favorite-btn is-saved"
                    title="Remove from favorites"
                  >
                    <span>♥</span>
                  </button>
                </div>
              </div>

              <div class="card-preview">
                <div class="listing-summary">
                  <span class="dates-preview">{{ formatDate(listing.startDate) }} - {{ formatDate(listing.endDate) }}</span>
                </div>
                <div class="tags" v-if="getItemTags(listing._id).length > 0">
                  <span v-for="tag in getItemTags(listing._id)" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                </div>
                <div class="expand-hint">
                  <span>{{ expandedListing === listing._id ? 'Click to collapse' : 'Click for details' }}</span>
                  <span class="expand-icon">{{ expandedListing === listing._id ? '▲' : '▼' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded Roommate Detail Modal -->
        <div v-if="expandedPosting" class="detail-overlay" @click="closeDetails">
          <div class="detail-panel" @click.stop>
            <div class="detail-header">
              <h2>{{ getExpandedPosting().city }} - Roommate Details</h2>
              <button @click="closeDetails" class="close-btn">×</button>
            </div>

            <div class="detail-content">
              <!-- Personal Information Table -->
              <div class="info-section">
                <h3>Personal Information</h3>
                <table class="info-table">
                  <tr>
                    <td>Profile</td>
                    <td>{{ getExpandedPosting().gender }}, {{ getExpandedPosting().age }} years old</td>
                  </tr>
                  <tr v-if="getExpandedPosting().numberOfRoommates">
                    <td>Looking for</td>
                    <td>{{ getExpandedPosting().numberOfRoommates }} roommate{{ getExpandedPosting().numberOfRoommates > 1 ? 's' : '' }}</td>
                  </tr>
                </table>
              </div>

              <!-- Dates & Timeline -->
              <div class="info-section" v-if="getExpandedPosting().startDate || getExpandedPosting().endDate">
                <h3>Timeline</h3>
                <table class="info-table">
                  <tr v-if="getExpandedPosting().startDate && getExpandedPosting().endDate">
                    <td>Duration</td>
                    <td>{{ formatDate(getExpandedPosting().startDate) }} - {{ formatDate(getExpandedPosting().endDate) }}</td>
                  </tr>
                </table>
              </div>

              <!-- Lifestyle Preferences -->
              <div class="info-section">
                <h3>Lifestyle & Preferences</h3>
                <table class="info-table">
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
                </table>
              </div>

              <!-- Description -->
              <div class="info-section">
                <h3>About</h3>
                <div class="description-full">
                  {{ getExpandedPosting().description }}
                </div>
              </div>

              <!-- Tags -->
              <div class="info-section" v-if="getItemTags(getExpandedPosting()._id).length > 0">
                <h3>Status</h3>
                <div class="tags">
                  <span v-for="tag in getItemTags(getExpandedPosting()._id)" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="detail-actions">
              <button
                @click="contactPoster(getExpandedPosting()._id)"
                class="contact-btn"
                :disabled="isContacting[getExpandedPosting()._id]"
              >
                {{ isContacting[getExpandedPosting()._id] ? "Sending..." : "Contact Me" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Expanded Housing Detail Modal -->
        <div v-if="expandedListing" class="detail-overlay" @click="closeListing">
          <div class="detail-panel" @click.stop>
            <div class="detail-header">
              <h2>{{ getExpandedListing().title }} - Housing Details</h2>
              <button @click="closeListing" class="close-btn">×</button>
            </div>

            <div class="detail-content">
              <!-- Property Information -->
              <div class="info-section">
                <h3>Property Information</h3>
                <table class="info-table">
                  <tr>
                    <td>Address</td>
                    <td>{{ getExpandedListing().address }}</td>
                  </tr>
                  <tr>
                    <td>Price</td>
                    <td>${{ getExpandedListing().price }}/month</td>
                  </tr>
                </table>
              </div>

              <!-- Availability -->
              <div class="info-section">
                <h3>Availability</h3>
                <table class="info-table">
                  <tr>
                    <td>Duration</td>
                    <td>{{ formatDate(getExpandedListing().startDate) }} - {{ formatDate(getExpandedListing().endDate) }}</td>
                  </tr>
                </table>
              </div>

              <!-- Tags -->
              <div class="info-section" v-if="getItemTags(getExpandedListing()._id).length > 0">
                <h3>Status</h3>
                <div class="tags">
                  <span v-for="tag in getItemTags(getExpandedListing()._id)" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="detail-actions">
              <button
                @click="sendInterest(getExpandedListing()._id)"
                class="contact-btn"
                :disabled="isSendingInterest[getExpandedListing()._id]"
              >
                {{ isSendingInterest[getExpandedListing()._id] ? "Sending..." : "Send Interest" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useSessionStore } from '../stores/session.js';
import { savedItems as savedItemsApi, roommatePostings as roommatePostingsApi, listings as listingsApi } from '../utils/api.js';

console.log('savedItemsApi:', savedItemsApi);
console.log('savedItemsApi.getSavedItems:', savedItemsApi?.getSavedItems);

export default {
  name: 'Favorites',
  setup() {
    const sessionStore = useSessionStore();
    const savedItems_data = ref([]);
    const savedItemsMap = ref(new Map()); // Map of itemId -> {tags: []}
    const allRoommatePostings = ref([]);
    const allHousingListings = ref([]);
    const isLoading = ref(false);
    const error = ref('');
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
      return savedItems_data.value.filter(item => item.city !== undefined);
    });

    const housingListings = computed(() => {
      // Filter saved items that are housing listings (have 'title' and 'address' fields)
      return savedItems_data.value.filter(item => item.title !== undefined && item.address !== undefined);
    });

    const getItemTags = (itemId) => {
      const savedItem = savedItemsMap.value.get(itemId);
      const tags = savedItem && savedItem.tags ? savedItem.tags : [];
      console.log(`getItemTags(${itemId}):`, tags, 'savedItemsMap:', Array.from(savedItemsMap.value.entries()));
      return tags;
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
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

    const fetchSavedItems = async () => {
      if (!sessionStore.user || !sessionStore.user.id) {
        error.value = 'Please log in to view your favorites';
        return;
      }

      isLoading.value = true;
      error.value = '';

      try {
        const result = await savedItemsApi.getSavedItems(sessionStore.user.id);
        console.log('Fetched saved items raw result:', result);

        // API returns {results: [...]} structure where each item is {user: "...", savedItem: {item: "id", tags: [...]}}
        const items = result?.results || result;
        console.log('Items to process:', items, 'Is array:', Array.isArray(items));

        if (!Array.isArray(items)) {
          savedItems_data.value = [];
          return;
        }

        // Extract item IDs and build tags map
        const itemIds = [];
        const tagsMap = new Map();

        items.forEach(saved => {
          console.log('Processing saved item structure:', JSON.stringify(saved, null, 2));
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
            console.log('Saved item does not have expected structure');
          }
        });

        savedItemsMap.value = tagsMap;
        console.log('Extracted item IDs:', itemIds);
        console.log('Tags map:', Array.from(tagsMap.entries()));

        // Fetch the actual postings using the IDs
        // For now, fetch all postings and filter by IDs
        const [roommates, housing] = await Promise.all([
          roommatePostingsApi.getAll(),
          listingsApi.getAll()
        ]);

        const allPostings = [...(roommates || []), ...(housing || [])];
        console.log('All postings:', allPostings);

        // Filter to only saved items
        savedItems_data.value = allPostings.filter(posting => itemIds.includes(posting._id));
        console.log('Filtered saved items:', savedItems_data.value);
      } catch (err) {
        console.error('Error fetching saved items:', err);
        error.value = err.message || 'Failed to load favorites';
      } finally {
        isLoading.value = false;
      }
    };



    const contactPoster = async (postingId) => {
      if (!sessionStore.user || !sessionStore.user.id) {
        alert('Please log in to contact posters');
        return;
      }

      // Set loading state for this specific posting
      isContacting.value[postingId] = true;

      try {
        console.log('Contacting poster for posting:', postingId);
        const result = await roommatePostingsApi.contact(postingId);
        console.log('Contact sent successfully:', result);
        alert('Your interest has been sent to the posting owner!');

        // Wait a moment for backend to process, then refetch saved items
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchSavedItems();
      } catch (err) {
        console.error('Error contacting poster:', err);
        alert('Failed to send contact request: ' + (err.message || 'Unknown error'));
      } finally {
        // Clear loading state for this specific posting
        isContacting.value[postingId] = false;
      }
    };

    const sendInterest = async (listingId) => {
      if (!sessionStore.user || !sessionStore.user.id) {
        alert('Please log in to send interest');
        return;
      }

      // Set loading state for this specific listing
      isSendingInterest.value[listingId] = true;

      try {
        console.log('Sending interest for listing:', listingId);
        const result = await listingsApi.sendInterest(listingId);
        console.log('Interest sent successfully:', result);
        alert('Your interest has been sent to the listing owner!');

        // Wait a moment for backend to process, then refetch saved items
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchSavedItems();
      } catch (err) {
        console.error('Error sending interest:', err);
        alert('Failed to send interest: ' + (err.message || 'Unknown error'));
      } finally {
        // Clear loading state for this specific listing
        isSendingInterest.value[listingId] = false;
      }
    };

    const removeFavorite = async (itemId) => {
      if (!sessionStore.user || !sessionStore.user.id) {
        alert('Please log in');
        return;
      }

      try {
        await savedItemsApi.removeItem(sessionStore.user.id, itemId);
        // Remove from local state
        savedItems_data.value = savedItems_data.value.filter(item => item._id !== itemId);
        console.log('Removed favorite:', itemId);
      } catch (err) {
        console.error('Error removing favorite:', err);
        alert('Failed to remove favorite: ' + (err.message || 'Unknown error'));
      }
    };

    onMounted(async () => {
      await fetchSavedItems();
    });

    return {
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
      // New expanded view functionality
      expandedPosting,
      expandedListing,
      togglePostingDetails,
      toggleListingDetails,
      closeDetails,
      closeListing,
      getExpandedPosting,
      getExpandedListing,
      truncateText,
    };
  }
};
</script>

<style scoped>
.homepage {
  flex: 1;
  width: 100%;
  min-height: calc(100vh - 60px);
}

.hero {
  background: rgb(47, 71, 62);
  color: white;
  padding: 2rem 2rem;
  text-align: center;
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
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
  line-height: 1;
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

.age-gender, .address-preview {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.roommate-count, .price-preview {
  font-size: 0.85rem;
  color: #1e5a2e;
  font-weight: 600;
}

.card-actions {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex-shrink: 0;
}

.card-preview {
  padding: 0 1.25rem 1.25rem;
}

.description-preview, .listing-summary {
  color: #666;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
}

.dates-preview {
  font-size: 0.85rem;
  color: #666;
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
  background: linear-gradient(135deg, #1e5a2e, #2d7a3d);
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

@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }

  .hero h2 {
    font-size: 2rem;
  }
}
</style>
