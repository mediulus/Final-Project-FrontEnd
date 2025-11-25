<template>
  <main class="homepage">
    <section class="hero">
      <h2>My Postings</h2>
      <p>All your housing listings and roommate postings</p>
    </section>

    <section class="listings-section">
      <div v-if="isLoading" class="loading">Loading your postings...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="roommatePostings.length === 0 && housingListings.length === 0" class="no-listings">
        No postings yet. Start creating listings or roommate postings!
      </div>
      <div v-else>
        <!-- Roommate Postings -->
        <div v-if="roommatePostings.length > 0">
          <h3 class="section-title">My Roommate Postings</h3>
          <div class="listings-grid">
            <div v-for="posting in roommatePostings" :key="posting._id" class="listing-card">
              <div class="listing-header">
                <h3>{{ posting.city }}</h3>
                <button 
                  @click="deleteRoommatePosting(posting._id)" 
                  class="delete-btn"
                  title="Delete posting"
                >
                  <span>🗑️</span>
                </button>
              </div>

              <div class="listing-details">
                <p class="info"><strong>👤</strong> {{ posting.gender }}, {{ posting.age }} years old</p>
                <p class="description">{{ posting.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Housing Listings -->
        <div v-if="housingListings.length > 0" class="section">
          <h3 class="section-title">My Housing Listings</h3>
          <div class="listings-grid">
            <div v-for="listing in housingListings" :key="listing._id" class="listing-card">
              <div class="listing-header">
                <h3>{{ listing.title }}</h3>
                <button 
                  @click="deleteHousingListing(listing._id)" 
                  class="delete-btn"
                  title="Delete listing"
                >
                  <span>🗑️</span>
                </button>
              </div>

              <div class="listing-details">
                <p class="address"><strong>📍</strong> {{ listing.address }}</p>
                <p class="dates">
                  <strong>📅</strong> {{ formatDate(listing.startDate) }} - {{ formatDate(listing.endDate) }}
                </p>
                <p class="price"><strong>💵</strong> ${{ listing.price }}/month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useSessionStore } from '../stores/session.js';
import { roommatePostings as roommatePostingsApi, listings as listingsApi } from '../utils/api.js';

export default {
  name: 'MyPostings',
  setup() {
    const sessionStore = useSessionStore();
    const roommatePostings = ref([]);
    const housingListings = ref([]);
    const isLoading = ref(false);
    const error = ref('');

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const fetchMyPostings = async () => {
      if (!sessionStore.user || !sessionStore.user.id) {
        error.value = 'Please log in to view your postings';
        return;
      }

      isLoading.value = true;
      error.value = '';

      try {
        const userId = sessionStore.user.id || sessionStore.user.user;
        console.log('[MyPostings] Fetching postings for user:', userId);

        // Fetch roommate postings by poster ID
        const roommateResult = await roommatePostingsApi.getByPosterId(userId);
        console.log('[MyPostings] Roommate postings:', roommateResult);
        roommatePostings.value = Array.isArray(roommateResult) ? roommateResult : [roommateResult];

        // Fetch all housing listings and filter by lister
        const allListings = await listingsApi.getAll();
        console.log('[MyPostings] All listings:', allListings);
        housingListings.value = (allListings || []).filter(listing => listing.lister === userId);
        console.log('[MyPostings] Filtered housing listings:', housingListings.value);
      } catch (err) {
        console.error('[MyPostings] Error fetching postings:', err);
        error.value = err.message || 'Failed to load your postings';
      } finally {
        isLoading.value = false;
      }
    };

    const deleteRoommatePosting = async (postingId) => {
      if (!confirm('Are you sure you want to delete this roommate posting?')) {
        return;
      }

      try {
        await roommatePostingsApi.delete(postingId);
        roommatePostings.value = roommatePostings.value.filter(p => p._id !== postingId);
        console.log('[MyPostings] Deleted roommate posting:', postingId);
      } catch (err) {
        console.error('[MyPostings] Error deleting roommate posting:', err);
        alert('Failed to delete posting: ' + (err.message || 'Unknown error'));
      }
    };

    const deleteHousingListing = async (listingId) => {
      if (!confirm('Are you sure you want to delete this housing listing?')) {
        return;
      }

      try {
        await listingsApi.delete(listingId);
        housingListings.value = housingListings.value.filter(l => l._id !== listingId);
        console.log('[MyPostings] Deleted housing listing:', listingId);
      } catch (err) {
        console.error('[MyPostings] Error deleting housing listing:', err);
        alert('Failed to delete listing: ' + (err.message || 'Unknown error'));
      }
    };

    onMounted(async () => {
      await fetchMyPostings();
    });

    return {
      roommatePostings,
      housingListings,
      isLoading,
      error,
      formatDate,
      deleteRoommatePosting,
      deleteHousingListing
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
  color: rgba(255, 255, 255, 0.9);
}

.listings-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.section {
  margin-top: 3rem;
}

.section-title {
  font-size: 1.8rem;
  color: #123619;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #1e5a2e;
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
  color: #123619;
  font-size: 1.4rem;
  margin: 0;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
  line-height: 1;
}

.delete-btn:hover {
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

@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }

  .hero h2 {
    font-size: 2rem;
  }
}
</style>
