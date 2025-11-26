<template>
  <main class="homepage">
    <section class="hero">
      <h2>My Postings</h2>
      <p>All your housing listings and roommate postings</p>
    </section>

    <section class="listings-section">
      <div v-if="isLoading" class="loading">Loading your postings...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div
        v-else-if="
          roommatePostings.length === 0 && housingListings.length === 0
        "
        class="no-listings"
      >
        No postings yet. Start creating listings or roommate postings!
      </div>
      <div v-else>
        <!-- Roommate Postings -->
        <div v-if="roommatePostings.length > 0">
          <h3 class="section-title">My Roommate Postings</h3>
          <div class="listings-grid">
            <div
              v-for="posting in roommatePostings"
              :key="posting?._id || posting"
              class="listing-card"
            >
              <div class="listing-header">
                <h3>{{ posting.city }}</h3>
              </div>

              <div class="listing-details">
                <p class="info">
                  <strong>👤</strong> {{ posting.gender }},
                  {{ posting.age }} years old
                </p>
                <p class="description">{{ posting.description }}</p>
              </div>

              <div class="listing-actions">
                <button
                  @click="deleteRoommatePosting(posting._id)"
                  class="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Housing Listings -->
        <div v-if="housingListings.length > 0" class="section">
          <h3 class="section-title">My Housing Listings</h3>
          <div class="listings-grid">
            <div
              v-for="listing in housingListings"
              :key="listing?._id || listing"
              class="listing-card"
            >
              <div class="listing-header">
                <h3>{{ listing.title }}</h3>
                <div class="header-actions">
                  <div class="owner-badge">Your Listing</div>
                </div>
              </div>

              <div class="listing-details">
                <p class="address"><strong>📍</strong> {{ listing.address }}</p>
                <p class="dates">
                  <strong>📅</strong> {{ formatDate(listing.startDate) }} -
                  {{ formatDate(listing.endDate) }}
                </p>
                <p class="price">
                  <strong>💵</strong> ${{ listing.price }}/month
                </p>

                <div
                  v-if="listing.amenities && listing.amenities.length > 0"
                  class="amenities"
                >
                  <strong>Amenities:</strong>
                  <ul>
                    <li v-for="amenity in listing.amenities" :key="amenity._id">
                      {{ amenity.title }} ({{ amenity.distance }}mi away)
                    </li>
                  </ul>
                </div>
              </div>

              <div class="listing-actions">
                <button @click="editListing(listing)" class="edit-btn">
                  Edit
                </button>
                <button
                  @click="deleteHousingListing(listing._id)"
                  class="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Edit Listing Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h2>Edit Listing</h2>
        <form @submit.prevent="handleEditListing">
          <div class="form-group">
            <label for="edit-title">Title *</label>
            <input
              type="text"
              id="edit-title"
              v-model="editForm.title"
              required
              placeholder="e.g., Cozy Studio Near MIT"
            />
          </div>

          <div class="form-group">
            <label for="edit-address">Address *</label>
            <input
              type="text"
              id="edit-address"
              v-model="editForm.address"
              required
              placeholder="e.g., 123 Main St, Cambridge, MA"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-startDate">Start Date *</label>
              <input
                type="date"
                id="edit-startDate"
                v-model="editForm.startDate"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit-endDate">End Date *</label>
              <input
                type="date"
                id="edit-endDate"
                v-model="editForm.endDate"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-price">Price ($/month) *</label>
            <input
              type="number"
              id="edit-price"
              v-model.number="editForm.price"
              required
              min="0"
              placeholder="e.g., 1500"
            />
          </div>

          <div class="form-group">
            <label>Amenities</label>
            <div class="amenities-list">
              <div
                v-for="(amenity, index) in editForm.amenities"
                :key="index"
                class="amenity-item"
              >
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
                <button
                  type="button"
                  @click="removeEditAmenity(index)"
                  class="remove-amenity-btn"
                >
                  ×
                </button>
              </div>
            </div>
            <button
              type="button"
              @click="addEditAmenity"
              class="add-amenity-btn"
            >
              + Add Amenity
            </button>
          </div>

          <div v-if="editError" class="error-message">{{ editError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn" :disabled="isEditing">
              {{ isEditing ? "Saving..." : "Save Changes" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from "vue";
import { useSessionStore } from "../stores/session.js";
import {
  roommatePostings as roommatePostingsApi,
  listings as listingsApi,
} from "../utils/api.js";

export default {
  name: "MyPostings",
  setup() {
    const sessionStore = useSessionStore();
    const roommatePostings = ref([]);
    const housingListings = ref([]);
    const isLoading = ref(false);
    const error = ref("");
    const showEditModal = ref(false);
    const isEditing = ref(false);
    const editError = ref("");
    const editingListingId = ref(null);
    const editForm = ref({
      title: "",
      address: "",
      startDate: "",
      endDate: "",
      price: "",
      amenities: [],
    });

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const fetchMyPostings = async () => {
      if (!sessionStore.user || !sessionStore.user.id) {
        error.value = "Please log in to view your postings";
        return;
      }

      isLoading.value = true;
      error.value = "";

      try {
        const userId = sessionStore.user.id || sessionStore.user.user;
        console.log("[MyPostings] Fetching postings for user:", userId);

        // Fetch all roommate postings and filter by poster (consistent with listings approach)
        const allRoommatePostings = await roommatePostingsApi.getAll();
        console.log("[MyPostings] All roommate postings:", allRoommatePostings);
        const allRoommateArray = Array.isArray(allRoommatePostings)
          ? allRoommatePostings
          : [];
        // Filter by poster ID and ensure valid items
        roommatePostings.value = allRoommateArray.filter(
          (posting) => posting && posting._id && posting.poster === userId
        );
        console.log(
          "[MyPostings] Filtered roommate postings:",
          roommatePostings.value
        );

        // Fetch all housing listings and filter by lister
        const allListings = await listingsApi.getAll();
        console.log("[MyPostings] All listings:", allListings);
        const allListingsArray = Array.isArray(allListings) ? allListings : [];
        // Filter out null/undefined items, ensure _id exists, and match lister
        housingListings.value = allListingsArray.filter(
          (listing) => listing && listing._id && listing.lister === userId
        );
        console.log(
          "[MyPostings] Filtered housing listings:",
          housingListings.value
        );
      } catch (err) {
        console.error("[MyPostings] Error fetching postings:", err);
        error.value = err.message || "Failed to load your postings";
      } finally {
        isLoading.value = false;
      }
    };

    const deleteRoommatePosting = async (postingId) => {
      if (!confirm("Are you sure you want to delete this roommate posting?")) {
        return;
      }

      try {
        await roommatePostingsApi.delete(postingId);
        roommatePostings.value = roommatePostings.value.filter(
          (p) => p._id !== postingId
        );
        console.log("[MyPostings] Deleted roommate posting:", postingId);
      } catch (err) {
        console.error("[MyPostings] Error deleting roommate posting:", err);
        alert("Failed to delete posting: " + (err.message || "Unknown error"));
      }
    };

    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const editListing = (listing) => {
      editingListingId.value = listing._id;
      editForm.value = {
        title: listing.title || "",
        address: listing.address || "",
        startDate: formatDateForInput(listing.startDate),
        endDate: formatDateForInput(listing.endDate),
        price: listing.price || "",
        amenities: listing.amenities
          ? listing.amenities.map((a) => ({
              _id: a._id,
              title: a.title || "",
              distance: a.distance || "",
            }))
          : [],
      };
      editError.value = "";
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editError.value = "";
      editingListingId.value = null;
      editForm.value = {
        title: "",
        address: "",
        startDate: "",
        endDate: "",
        price: "",
        amenities: [],
      };
    };

    const addEditAmenity = () => {
      editForm.value.amenities.push({
        title: "",
        distance: "",
      });
    };

    const removeEditAmenity = (index) => {
      editForm.value.amenities.splice(index, 1);
    };

    const handleEditListing = async () => {
      if (!editingListingId.value) return;

      isEditing.value = true;
      editError.value = "";

      try {
        const listingId = editingListingId.value;
        const listing = housingListings.value.find((l) => l._id === listingId);
        if (!listing) {
          editError.value = "Listing not found";
          return;
        }

        // Update title if changed
        if (editForm.value.title !== listing.title) {
          await listingsApi.editTitle(listingId, editForm.value.title);
        }

        // Update address if changed
        if (editForm.value.address !== listing.address) {
          await listingsApi.editAddress(listingId, editForm.value.address);
        }

        // Update start date if changed
        const newStartDate = new Date(editForm.value.startDate);
        const oldStartDate = new Date(listing.startDate);
        if (newStartDate.getTime() !== oldStartDate.getTime()) {
          await listingsApi.editStartDate(listingId, editForm.value.startDate);
        }

        // Update end date if changed
        const newEndDate = new Date(editForm.value.endDate);
        const oldEndDate = new Date(listing.endDate);
        if (newEndDate.getTime() !== oldEndDate.getTime()) {
          await listingsApi.editEndDate(listingId, editForm.value.endDate);
        }

        // Update price if changed
        if (editForm.value.price !== listing.price) {
          await listingsApi.editPrice(listingId, editForm.value.price);
        }

        // Handle amenities
        const oldAmenities = listing.amenities || [];
        const newAmenities = editForm.value.amenities || [];

        // Delete amenities that were removed
        for (const oldAmenity of oldAmenities) {
          const stillExists = newAmenities.some(
            (newA) =>
              newA._id === oldAmenity._id &&
              newA.title === oldAmenity.title &&
              newA.distance === oldAmenity.distance
          );
          if (!stillExists && oldAmenity._id) {
            await listingsApi.deleteAmenity(listingId, oldAmenity._id);
          }
        }

        // Add new amenities
        for (const newAmenity of newAmenities) {
          // If it doesn't have an _id, it's a new amenity
          if (
            !newAmenity._id &&
            newAmenity.title &&
            newAmenity.distance !== ""
          ) {
            await listingsApi.addAmenity(
              listingId,
              newAmenity.title,
              newAmenity.distance
            );
          }
          // If it has an _id but values changed, delete old and add new
          else if (newAmenity._id) {
            const oldAmenity = oldAmenities.find(
              (a) => a._id === newAmenity._id
            );
            if (
              oldAmenity &&
              (oldAmenity.title !== newAmenity.title ||
                oldAmenity.distance !== newAmenity.distance)
            ) {
              await listingsApi.deleteAmenity(listingId, newAmenity._id);
              if (newAmenity.title && newAmenity.distance !== "") {
                await listingsApi.addAmenity(
                  listingId,
                  newAmenity.title,
                  newAmenity.distance
                );
              }
            }
          }
        }

        // Refresh listings to get updated data
        await fetchMyPostings();
        closeEditModal();
        alert("Listing updated successfully!");
      } catch (err) {
        console.error("[MyPostings] Error editing listing:", err);
        editError.value = err.message || "Failed to update listing";
      } finally {
        isEditing.value = false;
      }
    };

    const deleteHousingListing = async (listingId) => {
      if (!confirm("Are you sure you want to delete this housing listing?")) {
        return;
      }

      try {
        await listingsApi.delete(listingId);
        housingListings.value = housingListings.value.filter(
          (l) => l._id !== listingId
        );
        console.log("[MyPostings] Deleted housing listing:", listingId);
      } catch (err) {
        console.error("[MyPostings] Error deleting housing listing:", err);
        alert("Failed to delete listing: " + (err.message || "Unknown error"));
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
      editListing,
      deleteHousingListing,
      showEditModal,
      isEditing,
      editError,
      editForm,
      closeEditModal,
      addEditAmenity,
      removeEditAmenity,
      handleEditListing,
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
  font-size: 1.5rem;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.owner-badge {
  background: #1e5a2e;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.delete-btn-header {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
  line-height: 1;
}

.delete-btn-header:hover {
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

.amenities {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.amenities strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #123619;
}

.amenities ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.amenities li {
  padding: 0.25rem 0;
  color: #555;
  font-size: 0.9rem;
}

.listing-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #f0f0f0;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.edit-btn {
  background: #1e5a2e;
  color: white;
}

.edit-btn:hover {
  background: #123619;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
  box-sizing: border-box;
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
  background: #1e5a2e;
  color: white;
  border: none;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-amenity-btn:hover {
  background: #123619;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}

.cancel-btn {
  background: #e0e0e0;
  color: #333;
}

.cancel-btn:hover {
  background: #d0d0d0;
}

.submit-btn {
  background: #1e5a2e;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #123619;
  transform: translateY(-2px);
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

  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
}
</style>
