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
        <div v-if="roommatePostings.length > 0" class="listings-container">
          <h3 class="section-title">My Roommate Postings</h3>
          <div class="listings-grid">
            <div
              v-for="posting in roommatePostings"
              :key="posting?._id || posting"
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
                  <div class="owner-badge">Your Posting</div>
                  <button @click="editRoommatePosting(posting)" class="edit-btn">
                    Edit
                  </button>
                  <button @click="deleteRoommatePosting(posting._id)" class="delete-btn">
                    Delete
                  </button>
                </div>
              </div>

              <div class="card-preview">
                <p class="description-preview">{{ truncateText(posting.description, 100) }}</p>
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
          <h3 class="section-title">My Housing Listings</h3>
          <div class="listings-grid">
            <div
              v-for="listing in housingListings"
              :key="listing?._id || listing"
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
                  <div class="owner-badge">Your Listing</div>
                  <button @click="editListing(listing)" class="edit-btn">
                    Edit
                  </button>
                  <button @click="deleteHousingListing(listing._id)" class="delete-btn">
                    Delete
                  </button>
                </div>
              </div>

              <div class="card-preview">
                <div class="listing-summary">
                  <span class="dates-preview">{{ formatDate(listing.startDate) }} - {{ formatDate(listing.endDate) }}</span>
                </div>
                <div class="expand-hint">
                  <span>{{ expandedListing === listing._id ? 'Click to collapse' : 'Click for details' }}</span>
                  <span class="expand-icon">{{ expandedListing === listing._id ? '▲' : '▼' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Expanded Roommate Detail Modal -->
    <div v-if="expandedPosting" class="detail-overlay" @click="closeDetails">
      <div class="detail-panel" @click.stop>
        <div class="detail-header">
          <h2>{{ getExpandedPosting().city }} - My Roommate Posting</h2>
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

          <!-- Description -->
          <div class="info-section">
            <h3>About</h3>
            <div class="description-full">
              {{ getExpandedPosting().description }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="detail-actions">
          <button @click="editRoommatePosting(getExpandedPosting())" class="edit-btn">
            Edit Posting
          </button>
          <button @click="deleteRoommatePosting(getExpandedPosting()._id)" class="delete-btn">
            Delete Posting
          </button>
        </div>
      </div>
    </div>

    <!-- Expanded Housing Detail Modal -->
    <div v-if="expandedListing" class="detail-overlay" @click="closeListing">
      <div class="detail-panel" @click.stop>
        <div class="detail-header">
          <h2>{{ getExpandedListing().title }} - My Housing Listing</h2>
          <button @click="closeListing" class="close-btn">×</button>
        </div>

        <div class="detail-content">
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
                  <td>{{ amenity.distance && amenity.distance > 0 ? `${amenity.distance} miles away` : 'On-site' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="detail-actions">
          <button @click="editListing(getExpandedListing())" class="edit-btn">
            Edit Listing
          </button>
          <button @click="deleteHousingListing(getExpandedListing()._id)" class="delete-btn">
            Delete Listing
          </button>
        </div>
      </div>
    </div>

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
            <label for="edit-type">Type *</label>
            <select id="edit-type" v-model="editForm.type" required>
              <option value="sublet">Sublet</option>
              <option value="renting">Renting</option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-description">Description</label>
            <textarea
              id="edit-description"
              v-model="editForm.description"
              rows="5"
              placeholder="Tell potential renters about your listing... Include details about the space, location, amenities, and what makes it special."
            ></textarea>
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

    <!-- Edit Roommate Posting Modal -->
    <div
      v-if="showEditRoommateModal"
      class="modal-overlay"
      @click="closeEditRoommateModal"
    >
      <div class="modal-content" @click.stop>
        <h2>Edit Roommate Posting</h2>
        <form @submit.prevent="handleEditRoommatePosting">
          <div class="form-group">
            <label for="edit-roommate-city">City *</label>
            <input
              type="text"
              id="edit-roommate-city"
              v-model="editRoommateForm.city"
              required
              placeholder="e.g., Cambridge"
            />
          </div>

          <div class="form-group">
            <label for="edit-roommate-gender">Gender *</label>
            <select
              id="edit-roommate-gender"
              v-model="editRoommateForm.gender"
              required
            >
              <option value="" disabled>Select your gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-roommate-age">Age *</label>
            <input
              type="number"
              id="edit-roommate-age"
              v-model.number="editRoommateForm.age"
              required
              min="18"
              max="120"
              placeholder="e.g., 25"
            />
          </div>

          <div class="form-group">
            <label for="edit-roommate-numberOfRoommates"
              >Number of Roommates *</label
            >
            <input
              type="number"
              id="edit-roommate-numberOfRoommates"
              v-model.number="editRoommateForm.numberOfRoommates"
              required
              min="1"
              max="10"
              placeholder="e.g., 2"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-roommate-startDate">Start Date *</label>
              <input
                type="date"
                id="edit-roommate-startDate"
                v-model="editRoommateForm.startDate"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit-roommate-endDate">End Date *</label>
              <input
                type="date"
                id="edit-roommate-endDate"
                v-model="editRoommateForm.endDate"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-roommate-dailyRhythm">Daily Rhythm *</label>
            <select
              id="edit-roommate-dailyRhythm"
              v-model="editRoommateForm.dailyRhythm"
              required
            >
              <option value="" disabled>Select your daily rhythm</option>
              <option value="Morning-oriented (up early, asleep early)">
                Morning-oriented (up early, asleep early)
              </option>
              <option value="Balanced / flexible schedule">
                Balanced / flexible schedule
              </option>
              <option value="Night owl (up late, active later)">
                Night owl (up late, active later)
              </option>
              <option value="Varies a lot week-to-week">
                Varies a lot week-to-week
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-roommate-cleanlinessPreference"
              >Cleanliness Preference *</label
            >
            <select
              id="edit-roommate-cleanlinessPreference"
              v-model="editRoommateForm.cleanlinessPreference"
              required
            >
              <option value="" disabled>
                Select your cleanliness preference
              </option>
              <option value="Very tidy (clean daily / everything in its place)">
                Very tidy (clean daily / everything in its place)
              </option>
              <option value="Moderately tidy (clean weekly; some clutter okay)">
                Moderately tidy (clean weekly; some clutter okay)
              </option>
              <option
                value="Relaxed (don't mind clutter but clean occasionally)"
              >
                Relaxed (don't mind clutter but clean occasionally)
              </option>
              <option value="Messy (minimal cleaning unless necessary)">
                Messy (minimal cleaning unless necessary)
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-roommate-homeEnvironment"
              >Home Environment *</label
            >
            <select
              id="edit-roommate-homeEnvironment"
              v-model="editRoommateForm.homeEnvironment"
              required
            >
              <option value="" disabled>
                Select your home environment preference
              </option>
              <option value="Quiet (minimal noise, low visitors)">
                Quiet (minimal noise, low visitors)
              </option>
              <option value="Moderate (some noise, occasional visitors)">
                Moderate (some noise, occasional visitors)
              </option>
              <option value="Social / lively (friends over often)">
                Social / lively (friends over often)
              </option>
              <option value="Flexible / depends on schedule">
                Flexible / depends on schedule
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-roommate-guestsVisitors"
              >Guests & Visitors *</label
            >
            <select
              id="edit-roommate-guestsVisitors"
              v-model="editRoommateForm.guestsVisitors"
              required
            >
              <option value="" disabled>
                Select your guests & visitors preference
              </option>
              <option value="Prefer few or no guests">
                Prefer few or no guests
              </option>
              <option value="Occasional guests okay">
                Occasional guests okay
              </option>
              <option value="Comfortable with frequent guests">
                Comfortable with frequent guests
              </option>
              <option value="Comfortable with overnight guests">
                Comfortable with overnight guests
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-roommate-description">Description *</label>
            <textarea
              id="edit-roommate-description"
              v-model="editRoommateForm.description"
              required
              rows="4"
              placeholder="Tell us more about yourself and what you are looking for in a roommate"
            ></textarea>
          </div>

          <div v-if="editRoommateError" class="error-message">
            {{ editRoommateError }}
          </div>

          <div class="modal-actions">
            <button
              type="button"
              @click="closeEditRoommateModal"
              class="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="submit-btn"
              :disabled="isEditingRoommate"
            >
              {{ isEditingRoommate ? "Saving..." : "Save Changes" }}
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
      type: "",
      description: "",
      amenities: [],
    });
    const showEditRoommateModal = ref(false);
    const isEditingRoommate = ref(false);
    const editRoommateError = ref("");
    const editingRoommatePostingId = ref(null);
    const editRoommateForm = ref({
      city: "",
      gender: "",
      age: "",
      description: "",
      startDate: "",
      endDate: "",
      dailyRhythm: "",
      cleanlinessPreference: "",
      homeEnvironment: "",
      guestsVisitors: "",
      numberOfRoommates: "",
    });
    const expandedPosting = ref(null);
    const expandedListing = ref(null);

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

    const editRoommatePosting = (posting) => {
      editingRoommatePostingId.value = posting._id;
      editRoommateForm.value = {
        city: posting.city || "",
        gender: posting.gender || "",
        age: posting.age || "",
        description: posting.description || "",
        startDate: formatDateForInput(posting.startDate),
        endDate: formatDateForInput(posting.endDate),
        dailyRhythm: posting.dailyRhythm || "",
        cleanlinessPreference: posting.cleanlinessPreference || "",
        homeEnvironment: posting.homeEnvironment || "",
        guestsVisitors: posting.guestsVisitors || "",
        numberOfRoommates: posting.numberOfRoommates || "",
      };
      editRoommateError.value = "";
      showEditRoommateModal.value = true;
    };

    const closeEditRoommateModal = () => {
      showEditRoommateModal.value = false;
      editRoommateError.value = "";
      editingRoommatePostingId.value = null;
      editRoommateForm.value = {
        city: "",
        gender: "",
        age: "",
        description: "",
        startDate: "",
        endDate: "",
        dailyRhythm: "",
        cleanlinessPreference: "",
        homeEnvironment: "",
        guestsVisitors: "",
        numberOfRoommates: "",
      };
    };

    const handleEditRoommatePosting = async () => {
      if (!editingRoommatePostingId.value) {
        editRoommateError.value = "No posting selected for editing.";
        return;
      }

      isEditingRoommate.value = true;
      editRoommateError.value = "";

      try {
        const postingId = editingRoommatePostingId.value;
        const posting = roommatePostings.value.find((p) => p._id === postingId);
        if (!posting) {
          editRoommateError.value = "Posting not found";
          return;
        }

        const userId = sessionStore.user?.id || sessionStore.user?.user;
        if (!userId) {
          editRoommateError.value = "User not found";
          return;
        }

        // Compare and update only changed fields
        if (editRoommateForm.value.city !== posting.city) {
          await roommatePostingsApi.editCity(
            userId,
            editRoommateForm.value.city
          );
        }
        if (editRoommateForm.value.gender !== posting.gender) {
          await roommatePostingsApi.editGender(
            userId,
            editRoommateForm.value.gender
          );
        }
        if (editRoommateForm.value.age !== posting.age) {
          await roommatePostingsApi.editAge(userId, editRoommateForm.value.age);
        }
        if (editRoommateForm.value.description !== posting.description) {
          await roommatePostingsApi.editDescription(
            userId,
            editRoommateForm.value.description
          );
        }

        // Update dates if changed
        if (posting.startDate) {
          const newStartDate = new Date(editRoommateForm.value.startDate);
          const oldStartDate = new Date(posting.startDate);
          if (newStartDate.getTime() !== oldStartDate.getTime()) {
            await roommatePostingsApi.editStartDate(
              userId,
              editRoommateForm.value.startDate
            );
          }
        } else if (editRoommateForm.value.startDate) {
          await roommatePostingsApi.editStartDate(
            userId,
            editRoommateForm.value.startDate
          );
        }

        if (posting.endDate) {
          const newEndDate = new Date(editRoommateForm.value.endDate);
          const oldEndDate = new Date(posting.endDate);
          if (newEndDate.getTime() !== oldEndDate.getTime()) {
            await roommatePostingsApi.editEndDate(
              userId,
              editRoommateForm.value.endDate
            );
          }
        } else if (editRoommateForm.value.endDate) {
          await roommatePostingsApi.editEndDate(
            userId,
            editRoommateForm.value.endDate
          );
        }

        // Update new fields if changed
        if (editRoommateForm.value.dailyRhythm !== posting.dailyRhythm) {
          await roommatePostingsApi.editDailyRhythm(
            userId,
            editRoommateForm.value.dailyRhythm
          );
        }
        if (
          editRoommateForm.value.cleanlinessPreference !==
          posting.cleanlinessPreference
        ) {
          await roommatePostingsApi.editCleanlinessPreference(
            userId,
            editRoommateForm.value.cleanlinessPreference
          );
        }
        if (
          editRoommateForm.value.homeEnvironment !== posting.homeEnvironment
        ) {
          await roommatePostingsApi.editHomeEnvironment(
            userId,
            editRoommateForm.value.homeEnvironment
          );
        }
        if (editRoommateForm.value.guestsVisitors !== posting.guestsVisitors) {
          await roommatePostingsApi.editGuestsVisitors(
            userId,
            editRoommateForm.value.guestsVisitors
          );
        }

        // Refresh postings to get updated data
        await fetchMyPostings();
        closeEditRoommateModal();
      } catch (err) {
        console.error("[MyPostings] Error editing roommate posting:", err);
        editRoommateError.value = err.message || "Failed to update posting";
      } finally {
        isEditingRoommate.value = false;
      }
    };

    const editListing = (listing) => {
      editingListingId.value = listing._id;
      editForm.value = {
        title: listing.title || "",
        address: listing.address || "",
        startDate: formatDateForInput(listing.startDate),
        endDate: formatDateForInput(listing.endDate),
        price: listing.price || "",
        type: listing.type || "",
        description: listing.description || "",
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
        type: "",
        description: "",
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

        // Update type if changed
        if (editForm.value.type !== listing.type) {
          await listingsApi.editType(listingId, editForm.value.type);
        }
        const currentDescription = listing.description || "";
        const newDescription = editForm.value.description || "";
        if (newDescription !== currentDescription) {
          await listingsApi.editDescription(listingId, newDescription);
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

    // Expanded view methods
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

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
      return roommatePostings.value.find(posting => posting._id === expandedPosting.value) || {};
    };

    const getExpandedListing = () => {
      return housingListings.value.find(listing => listing._id === expandedListing.value) || {};
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
      editRoommatePosting,
      showEditRoommateModal,
      isEditingRoommate,
      editRoommateError,
      editRoommateForm,
      closeEditRoommateModal,
      handleEditRoommatePosting,
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

.posting-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.posting-card:hover {
  border-color: rgb(47, 71, 62);
  box-shadow: 0 4px 12px rgba(47, 71, 62, 0.1);
}

.posting-card.expanded {
  border-color: rgb(47, 71, 62);
  box-shadow: 0 4px 12px rgba(47, 71, 62, 0.15);
}

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title h3 {
  color: rgb(47, 71, 62);
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.quick-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.age-gender, .roommate-count, .address-preview, .price-preview {
  font-size: 0.85rem;
  color: #666;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.owner-badge {
  background: rgb(47, 71, 62);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.edit-btn, .delete-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background: rgb(47, 71, 62);
  color: white;
}

.edit-btn:hover {
  background: rgb(37, 61, 52);
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
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

.card-preview {
  padding: 0 1.25rem 1rem 1.25rem;
  flex: 1;
}

.description-preview {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
}

.listing-summary {
  margin-bottom: 0.75rem;
}

.dates-preview {
  font-size: 0.85rem;
  color: #666;
}

.expand-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgb(47, 71, 62);
  font-weight: 500;
  margin-top: 0.5rem;
}

.expand-icon {
  margin-left: 0.5rem;
}

/* Detail Modal Styles */
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.detail-panel {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
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

.detail-actions .edit-btn,
.detail-actions .delete-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.detail-actions .edit-btn {
  background: rgb(47, 71, 62);
  color: white;
}

.detail-actions .edit-btn:hover {
  background: rgb(37, 61, 52);
}

.detail-actions .delete-btn {
  background: #dc3545;
  color: white;
}

.detail-actions .delete-btn:hover {
  background: #c82333;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h2 {
  color: rgb(47, 71, 62);
  margin-bottom: 2rem;
  font-size: 1.875rem;
  font-weight: 700;
  border-bottom: 3px solid rgb(47, 71, 62);
  padding-bottom: 0.75rem;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: rgb(47, 71, 62);
  margin-bottom: 0.625rem;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
  background: #fafafa;
}

.form-group input:hover,
.form-group select:hover,
.form-group textarea:hover {
  border-color: #c0c0c0;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgb(47, 71, 62);
  background: white;
  box-shadow: 0 0 0 3px rgba(47, 71, 62, 0.1);
}

.form-group select {
  background-color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23123519' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

.form-group select:hover {
  background-color: #f9f9f9;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-group textarea::placeholder {
  color: #999;
  opacity: 0.8;
}

.form-group textarea:focus::placeholder {
  opacity: 0.5;
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
  border-color: rgb(47, 71, 62);
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
  background: rgb(22, 53, 27);
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
  background: rgb(15, 38, 19);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f0f0f0;
  justify-content: flex-end;
}

.cancel-btn,
.submit-btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.submit-btn {
  background: rgb(22, 53, 27);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 53, 27, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: fadeIn 0.2s ease;
}

.detail-panel {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  margin-bottom: 0;
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
  margin-bottom: 1.5rem;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section h3 {
  font-size: 1.2rem;
  color: rgb(47, 71, 62);
  margin-bottom: 0.75rem;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table td {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  font-size: 0.95rem;
  color: #333;
}

.info-table tr:nth-child(even) td {
  background: #f9f9f9;
}

.description-full {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.6;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.detail-actions .edit-btn,
.detail-actions .delete-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.detail-actions .edit-btn {
  background: rgb(22, 53, 27);
  color: white;
}

.detail-actions .edit-btn:hover {
  background: rgb(15, 38, 19);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.detail-actions .delete-btn {
  background: #dc3545;
  color: white;
}

.detail-actions .delete-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

  .detail-panel {
    width: 95%;
    padding: 1.5rem;
  }
}
</style>
