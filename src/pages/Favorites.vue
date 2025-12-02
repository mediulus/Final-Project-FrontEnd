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
        <div v-if="roommatePostings.length > 0">
          <h3 class="section-title">Roommate Postings</h3>
          <div class="listings-grid">
            <div v-for="posting in roommatePostings" :key="posting._id" class="listing-card">
              <div class="listing-header">
                <h3>{{ posting.city }}</h3>
                <button
                  @click="removeFavorite(posting._id)"
                  class="favorite-btn"
                  title="Remove from favorites"
                >
                  <span>♥</span>
                </button>
              </div>

              <div class="listing-details">
                <p class="info"><strong>👤</strong> {{ posting.gender }}, {{ posting.age }} years old</p>
                <p class="description">{{ posting.description }}</p>
                <div class="tags">
                  <span v-for="tag in getItemTags(posting._id)" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                </div>
                <button
                  @click="contactPoster(posting._id)"
                  class="contact-btn"
                  :disabled="isContacting[posting._id]"
                >
                  {{ isContacting[posting._id] ? 'Sending...' : 'Contact Me' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Housing Listings -->
        <div v-if="housingListings.length > 0" class="section">
          <h3 class="section-title">Housing Listings</h3>
          <div class="listings-grid">
            <div v-for="listing in housingListings" :key="listing._id" class="listing-card">
              <div class="listing-header">
                <h3>{{ listing.title }}</h3>
                <button
                  @click="removeFavorite(listing._id)"
                  class="favorite-btn"
                  title="Remove from favorites"
                >
                  <span>♥</span>
                </button>
              </div>

              <div class="listing-details">
                <p class="address"><strong>📍</strong> {{ listing.address }}</p>
                <p class="dates">
                  <strong>📅</strong> {{ formatDate(listing.startDate) }} - {{ formatDate(listing.endDate) }}
                </p>
                <p class="price"><strong>💵</strong> ${{ listing.price }}/month</p>
                <div class="tags">
                  <span v-for="tag in getItemTags(listing._id)" :key="tag" class="tag" :class="{ 'tag-contacted': tag === 'Contacted' }">{{ tag }}</span>
                </div>
                <button
                  @click="sendInterest(listing._id)"
                  class="interest-btn"
                  :disabled="isSendingInterest[listing._id]"
                >
                  {{ isSendingInterest[listing._id] ? 'Sending...' : 'Send Interest' }}
                </button>
              </div>
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
      isSendingInterest
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

@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }

  .hero h2 {
    font-size: 2rem;
  }
}
</style>
