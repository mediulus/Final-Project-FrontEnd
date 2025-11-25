<template>
  <main class="homepage">
    <section class="hero">
      <h2>Find Your Perfect Summer Housing</h2>
      <p>Browse available listings or create your own</p>
      <button @click="showCreateModal = true" class="create-btn">+ Create New Listing</button>
    </section>

    <section class="listings-section">
      <div v-if="loading" class="loading">Loading listings...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="listings.length === 0" class="no-listings">
        No listings available yet. Be the first to create one!
      </div>
      <div v-else class="listings-grid">
        <div v-for="listing in listings" :key="listing._id" class="listing-card">
          <div class="listing-header">
            <h3>{{ listing.title }}</h3>
            <div v-if="isOwner(listing)" class="owner-badge">Your Listing</div>
          </div>

          <div class="listing-details">
            <p class="address"><strong>📍</strong> {{ listing.address }}</p>
            <p class="dates">
              <strong>📅</strong> {{ formatDate(listing.startDate) }} - {{ formatDate(listing.endDate) }}
            </p>
            <p class="price"><strong>💵</strong> ${{ listing.price }}/month</p>

            <div v-if="listing.amenities && listing.amenities.length > 0" class="amenities">
              <strong>Amenities:</strong>
              <ul>
                <li v-for="amenity in listing.amenities" :key="amenity._id">
                  {{ amenity.title }} ({{ amenity.distance }}mi away)
                </li>
              </ul>
            </div>
          </div>

          <div v-if="isOwner(listing)" class="listing-actions">
            <button @click="editListing(listing)" class="edit-btn">Edit</button>
            <button @click="deleteListing(listing._id)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Create Listing Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <h2>Create New Listing</h2>
        <form @submit.prevent="handleCreateListing">
          <div class="form-group">
            <label for="title">Title *</label>
            <input
              type="text"
              id="title"
              v-model="newListing.title"
              required
              placeholder="e.g., Cozy Studio Near MIT"
            />
          </div>

          <div class="form-group">
            <label for="address">Address *</label>
            <input
              type="text"
              id="address"
              v-model="newListing.address"
              required
              placeholder="e.g., 123 Main St, Cambridge, MA"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                v-model="newListing.startDate"
                required
              />
            </div>

            <div class="form-group">
              <label for="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                v-model="newListing.endDate"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="price">Price ($/month) *</label>
            <input
              type="number"
              id="price"
              v-model.number="newListing.price"
              required
              min="0"
              placeholder="e.g., 1500"
            />
          </div>

          <div class="form-group">
            <label>Amenities</label>
            <div class="amenities-list">
              <div v-for="(amenity, index) in newListing.amenities" :key="index" class="amenity-item">
                <input
                  type="text"
                  v-model="amenity.title"
                  placeholder="e.g., T Stop"
                  class="amenity-title"
                />
                <input
                  type="number"
                  v-model.number="amenity.distance"
                  placeholder="Miles"
                  min="0"
                  step="0.1"
                  class="amenity-distance"
                />
                <button type="button" @click="removeAmenity(index)" class="remove-amenity-btn">×</button>
              </div>
            </div>
            <button type="button" @click="addAmenity" class="add-amenity-btn">+ Add Amenity</button>
          </div>

          <div v-if="createError" class="error-message">{{ createError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeCreateModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="submit-btn" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create Listing' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue';
import { listings, auth } from '../utils/api.js';

export default {
  name: 'FindHousing',
  setup() {
    const listingsData = ref([]);
    const loading = ref(true);
    const error = ref('');
    const showCreateModal = ref(false);
    const creating = ref(false);
    const createError = ref('');
    const currentUser = ref(null);

    const newListing = ref({
      title: '',
      address: '',
      startDate: '',
      endDate: '',
      price: '',
      amenities: [],
    });

    const addAmenity = () => {
      newListing.value.amenities.push({
        title: '',
        distance: ''
      });
    };

    const removeAmenity = (index) => {
      newListing.value.amenities.splice(index, 1);
    };

    const fetchListings = async () => {
      loading.value = true;
      error.value = '';
      try {
        const result = await listings.getAll();
        listingsData.value = result;
      } catch (err) {
        error.value = err.message || 'Failed to load listings';
      } finally {
        loading.value = false;
      }
    };

    // Removed incorrect getCurrentUser implementation. Use PasswordAuth endpoints for user info.

    const isOwner = (listing) => {
      return currentUser.value && listing.lister === currentUser.value;
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const handleCreateListing = async () => {
      creating.value = true;
      createError.value = '';

      console.log('Creating listing with data:', newListing.value);

      try {
        // Filter out empty amenities and format them properly
        const validAmenities = newListing.value.amenities
          .filter(a => a.title && a.distance !== '')
          .map(a => ({
            title: a.title,
            distance: Number(a.distance)
          }));

        console.log('Valid amenities:', validAmenities);

        const result = await listings.create(
          newListing.value.title,
          validAmenities,
          [], // photos - empty for now
          newListing.value.address,
          newListing.value.startDate,
          newListing.value.endDate,
          newListing.value.price
        );

        console.log('Listing created successfully:', result);

        // Reset form and close modal
        newListing.value = {
          title: '',
          address: '',
          startDate: '',
          endDate: '',
          price: '',
          amenities: [],
        };
        showCreateModal.value = false;

        // Refresh listings
        await fetchListings();
      } catch (err) {
        console.error('Create listing error:', err);
        createError.value = err.message || 'Failed to create listing';
      } finally {
        creating.value = false;
      }
    };

    const deleteListing = async (listingId) => {
      if (!confirm('Are you sure you want to delete this listing?')) {
        return;
      }

      try {
        await listings.delete(listingId);
        await fetchListings();
      } catch (err) {
        alert('Failed to delete listing: ' + (err.message || 'Unknown error'));
      }
    };

    const editListing = (listing) => {
      // TODO: Implement edit functionality
      alert('Edit functionality coming soon!');
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
      createError.value = '';
      newListing.value = {
        title: '',
        address: '',
        startDate: '',
        endDate: '',
        price: '',
        amenities: [],
      };
    };

    onMounted(() => {
      fetchListings();
    });

    return {
      listings: listingsData,
      loading,
      error,
      showCreateModal,
      creating,
      createError,
      newListing,
      addAmenity,
      removeAmenity,
      handleCreateListing,
      deleteListing,
      editListing,
      closeCreateModal,
  isOwner,
  formatDate,
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
  font-size: 1.5rem;
  margin: 0;
}

.owner-badge {
  background: #1e5a2e;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.listing-details {
  margin-bottom: 1rem;
}

.listing-details p {
  margin: 0.75rem 0;
  color: #555;
  font-size: 1rem;
}

.address {
  font-size: 1.05rem;
}

.amenities {
  margin-top: 1rem;
}

.amenities ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.amenities li {
  padding: 0.25rem 0;
  color: #666;
}

.listing-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 0.625rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.edit-btn {
  background: #1e5a2e;
  color: white;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.edit-btn:hover,
.delete-btn:hover {
  opacity: 0.85;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #123619;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #123619;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
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

.amenities-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.amenity-item {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 0.5rem;
  align-items: center;
}

.amenity-title,
.amenity-distance {
  padding: 0.625rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.amenity-title:focus,
.amenity-distance:focus {
  outline: none;
  border-color: #1e5a2e;
}

.remove-amenity-btn {
  width: 36px;
  height: 36px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.remove-amenity-btn:hover {
  opacity: 0.85;
}

.add-amenity-btn {
  padding: 0.625rem 1rem;
  background: #1e5a2e;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-amenity-btn:hover {
  opacity: 0.85;
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

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
