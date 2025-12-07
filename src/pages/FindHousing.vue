<template>
  <main class="homepage">
    <section class="hero">
      <h2>Find Summer Housing</h2>
      <p>Browse available listings or create your own</p>
      <button @click="showCreateModal = true" class="create-btn">
        + Create New Listing
      </button>
    </section>

    <!-- Filter Bar -->
    <section class="filter-bar">
      <div class="filter-container">
        <div class="filter-group">
          <label for="minPrice">Min Price ($)</label>
          <input
            type="number"
            id="minPrice"
            v-model.number="filters.minPrice"
            placeholder="0"
            min="0"
          />
        </div>

        <div class="filter-group">
          <label for="maxPrice">Max Price ($)</label>
          <input
            type="number"
            id="maxPrice"
            v-model.number="filters.maxPrice"
            placeholder="Any"
            min="0"
          />
        </div>

        <div class="filter-group">
          <label for="filterStartDate">Available From</label>
          <input type="date" id="filterStartDate" v-model="filters.startDate" />
        </div>

        <div class="filter-group">
          <label for="filterEndDate">Available Until</label>
          <input type="date" id="filterEndDate" v-model="filters.endDate" />
        </div>

        <div class="filter-actions">
          <button @click="applyFilters" class="search-btn">Search</button>
          <button @click="clearFilters" class="clear-btn">Clear</button>
        </div>
      </div>
    </section>

    <section class="listings-section">
      <!-- Map View Toggle -->
      <div class="view-toggle">
        <button 
          @click="showMapView = !showMapView" 
          class="toggle-btn"
          :class="{ active: showMapView }"
        >
          <span v-if="showMapView" class="toggle-content">
            <svg class="toggle-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Show List View
          </span>
          <span v-else class="toggle-content">
            <svg class="toggle-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
            Show Map View
          </span>
        </button>
        <span class="results-count">{{ filteredListings.length }} listing{{ filteredListings.length !== 1 ? 's' : '' }} found</span>
      </div>

      <!-- Map View -->
      <div v-if="showMapView && !loading" class="map-view-container">
        <GoogleMap 
          :center="{ lat: 42.3601, lng: -71.0942 }"
          :zoom="13"
          :markers="mapMarkers"
          @marker-click="handleMapMarkerClick"
        />
      </div>

      <div v-if="loading" class="loading">Loading listings...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="filteredListings.length === 0" class="no-listings">
        No listings match your filters. Try adjusting your search criteria.
      </div>
      <div v-else v-show="!showMapView" class="listings-grid">
        <div
          v-for="listing in filteredListings"
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
                  <svg class="info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  ${{ listing.price }}/month
                </span>
              </div>
            </div>

            <div class="card-actions" @click.stop>
              <button
                @click="toggleSavedItem(listing._id)"
                class="favorite-btn"
                :class="{ 'is-saved': isSaved(listing._id) }"
                :title="
                  isSaved(listing._id)
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                "
              >
                <span v-if="isSaved(listing._id)">♥</span>
                <span v-else>♡</span>
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
            <div class="expand-hint">
              <span>Click for details</span>
              <span class="expand-icon">+</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Expanded Housing Detail Modal -->
    <div v-if="expandedListing" class="detail-overlay" @click="closeListing">
      <div class="detail-panel" @click.stop>
        <div class="detail-header">
          <h2>{{ getExpandedListing().title }} - Housing Details</h2>
          <button @click="closeListing" class="close-btn">×</button>
        </div>

        <div class="detail-content">
          <!-- Photos Gallery -->
          <div v-if="getExpandedListing().photos && getExpandedListing().photos.length > 0" class="info-section">
            <h3>Photos</h3>
            <div class="modal-photos-gallery">
              <div
                v-for="(photo, index) in getExpandedListing().photos"
                :key="index"
                class="modal-photo-item"
              >
                <img
                  :src="getPhotoUrl(photo)"
                  :alt="getExpandedListing().title + ' photo ' + (index + 1)"
                  class="modal-photo"
                />
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
                  <td>{{ amenity.distance && amenity.distance > 0 ? `${amenity.distance} miles from home` : 'On-site' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="detail-actions">
            <button
            v-if="!isOwner(getExpandedListing()) && !getItemTags(getExpandedListing()._id).includes('Contacted')"
            @click="sendInterest(getExpandedListing()._id)"
            class="contact-btn"
            :disabled="isSendingInterest[getExpandedListing()._id]"
          >
            {{ isSendingInterest[getExpandedListing()._id] ? "Sending..." : "Send Interest" }}
            </button>

          <div v-if="!isOwner(getExpandedListing()) && getItemTags(getExpandedListing()._id).includes('Contacted')" class="contacted-message">
            Already contacted
          </div>

          <div v-if="isOwner(getExpandedListing())" class="owner-actions">
            <button @click="editListing(getExpandedListing())" class="edit-btn">Edit Listing</button>
            <button @click="deleteListing(getExpandedListing()._id)" class="delete-btn">Delete Listing</button>
          </div>
          </div>
        </div>
      </div>

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
            <div class="autocomplete-wrapper">
            <input
              type="text"
              id="address"
              v-model="newListing.address"
                @input="handleAddressInput"
                @focus="showSuggestions = autocompleteSuggestions.length > 0"
                @blur="handleAddressBlur"
              required
              placeholder="e.g., 123 Main St, Cambridge, MA"
                autocomplete="off"
              />
              <ul v-if="showSuggestions && autocompleteSuggestions.length" class="suggestions-list">
                <li
                  v-for="(suggestion, index) in autocompleteSuggestions"
                  :key="index"
                  @click="selectSuggestion(suggestion, false)"
                  class="suggestion-item"
                >
                  {{ getSuggestionText(suggestion) }}
                </li>
              </ul>
            </div>
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
            <label for="type">Type *</label>
            <select id="type" v-model="newListing.type" required>
              <option value="">Select type...</option>
              <option value="sublet">Sublet</option>
              <option value="renting">Renting</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="newListing.description"
              rows="5"
              placeholder="Tell potential renters about your listing... Include details about the space, location, amenities, and what makes it special."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Amenities</label>
            <div class="amenities-list">
              <div
                v-for="(amenity, index) in newListing.amenities"
                :key="index"
                class="amenity-item"
              >
                <input
                  type="text"
                  v-model="amenity.title"
                  placeholder="e.g., Laundry or T Stop"
                  class="amenity-title"
                />
                <input
                  type="number"
                  v-model.number="amenity.distance"
                  placeholder="Miles from home (optional)"
                  min="0"
                  step="0.01"
                  class="amenity-distance"
                />
                <button
                  type="button"
                  @click="removeAmenity(index)"
                  class="remove-amenity-btn"
                >
                  ×
                </button>
              </div>
            </div>
            <button type="button" @click="addAmenity" class="add-amenity-btn">
              + Add Amenity
            </button>
          </div>

          <!-- Photo Upload Section -->
          <div class="form-group">
            <label>Photos</label>
            <div class="photo-upload-section">
              <input
                type="file"
                ref="photoInput"
                multiple
                accept="image/*"
                @change="handlePhotoSelect"
                style="display: none"
              />

              <div class="photo-preview-grid" v-if="selectedPhotos.length > 0 || newListing.photos.length > 0">
                <!-- Existing uploaded photos -->
                <div v-for="(photo, index) in newListing.photos" :key="'uploaded-' + index" class="photo-preview-item">
                  <img :src="getPhotoUrl(photo)" :alt="'Photo ' + (index + 1)" class="photo-preview" />
                  <button type="button" @click="removeUploadedPhoto(index)" class="remove-photo-btn">×</button>
                  <div class="photo-status uploaded">✓ Uploaded</div>
                </div>

                <!-- New photos being uploaded -->
                <div v-for="(photo, index) in selectedPhotos" :key="'selected-' + index" class="photo-preview-item">
                  <img :src="photo.preview" :alt="'Selected photo ' + (index + 1)" class="photo-preview" />
                  <button type="button" @click="removeSelectedPhoto(index)" class="remove-photo-btn">×</button>
                  <div class="photo-status" :class="{ uploading: photo.uploading, error: photo.error }">
                    <span v-if="photo.uploading">Uploading...</span>
                    <span v-else-if="photo.error">{{ photo.error }}</span>
                    <span v-else>Ready to upload</span>
                  </div>
                </div>
              </div>

              <div class="photo-upload-actions">
                <button type="button" @click="triggerPhotoSelect" class="photo-upload-btn" :disabled="uploading">
                  📷 Add Photos ({{ newListing.photos.length + selectedPhotos.length }}/5)
                </button>
                <button
                  v-if="selectedPhotos.length > 0"
                  type="button"
                  @click="uploadSelectedPhotos"
                  class="upload-photos-btn"
                  :disabled="uploading"
                >
                  {{ uploading ? 'Uploading...' : 'Upload Photos' }}
                </button>
              </div>

              <div class="photo-upload-info">
                <p>• Max 5 photos • Each photo max 10MB • JPG, PNG, GIF supported</p>
                <button type="button" @click="testImageServiceWrapper" class="test-connection-btn" style="margin-top: 8px; font-size: 12px; padding: 4px 8px; background: #e3f2fd; color: #1976d2; border: 1px solid #1976d2;">
                  🔧 Test Photo Upload
                </button>
              </div>
            </div>
          </div>

          <div v-if="createError" class="error-message">{{ createError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeCreateModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn" :disabled="creating || uploading">
              {{ creating ? "Creating..." : uploading ? "Uploading Photos..." : "Create Listing" }}
            </button>
          </div>
        </form>
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
            <div class="autocomplete-wrapper">
            <input
              type="text"
              id="edit-address"
              v-model="editForm.address"
                @input="handleEditAddressInput"
                @focus="showEditSuggestions = editAutocompleteSuggestions.length > 0"
                @blur="handleEditAddressBlur"
              required
              placeholder="e.g., 123 Main St, Cambridge, MA"
                autocomplete="off"
              />
              <ul v-if="showEditSuggestions && editAutocompleteSuggestions.length" class="suggestions-list">
                <li
                  v-for="(suggestion, index) in editAutocompleteSuggestions"
                  :key="index"
                  @click="selectSuggestion(suggestion, true)"
                  class="suggestion-item"
                >
                  {{ getSuggestionText(suggestion) }}
                </li>
              </ul>
            </div>
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
                  placeholder="e.g., Laundry or T Stop"
                  class="amenity-title"
                />
                <input
                  type="number"
                  v-model.number="amenity.distance"
                  placeholder="Miles from home (optional)"
                  min="0"
                  step="0.01"
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

          <!-- Photo Upload Section for Edit -->
          <div class="form-group">
            <label>Photos</label>
            <div class="photo-upload-section">
              <input
                type="file"
                ref="editPhotoInput"
                multiple
                accept="image/*"
                @change="handleEditPhotoSelect"
                style="display: none"
              />

              <div class="photo-preview-grid" v-if="editSelectedPhotos.length > 0 || editForm.photos.length > 0">
                <!-- Existing uploaded photos -->
                <div v-for="(photo, index) in editForm.photos" :key="'edit-uploaded-' + index" class="photo-preview-item">
                  <img :src="getPhotoUrl(photo)" :alt="'Photo ' + (index + 1)" class="photo-preview" />
                  <button type="button" @click="removeEditUploadedPhoto(index)" class="remove-photo-btn">×</button>
                  <div class="photo-status uploaded">✓ Uploaded</div>
                </div>

                <!-- New photos being uploaded -->
                <div v-for="(photo, index) in editSelectedPhotos" :key="'edit-selected-' + index" class="photo-preview-item">
                  <img :src="photo.preview" :alt="'Selected photo ' + (index + 1)" class="photo-preview" />
                  <button type="button" @click="removeEditSelectedPhoto(index)" class="remove-photo-btn">×</button>
                  <div class="photo-status" :class="{ uploading: photo.uploading, error: photo.error }">
                    <span v-if="photo.uploading">Uploading...</span>
                    <span v-else-if="photo.error">{{ photo.error }}</span>
                    <span v-else>Ready to upload</span>
                  </div>
                </div>
              </div>

              <div class="photo-upload-actions">
                <button type="button" @click="triggerEditPhotoSelect" class="photo-upload-btn" :disabled="editUploading">
                  📷 Add Photos ({{ editForm.photos.length + editSelectedPhotos.length }}/5)
                </button>
                <button
                  v-if="editSelectedPhotos.length > 0"
                  type="button"
                  @click="uploadEditSelectedPhotos"
                  class="upload-photos-btn"
                  :disabled="editUploading"
                >
                  {{ editUploading ? 'Uploading...' : 'Upload Photos' }}
                </button>
              </div>

              <div class="photo-upload-info">
                <p>• Max 5 photos • Each photo max 10MB • JPG, PNG, GIF supported</p>
              </div>
            </div>
          </div>

          <div v-if="editError" class="error-message">{{ editError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn" :disabled="isEditing || editUploading">
              {{ isEditing ? "Saving..." : editUploading ? "Uploading Photos..." : "Save Changes" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import {
  listings,
  auth,
  savedItems,
  userInfo as userInfoApi,
} from "../utils/api.js";
import { apiRequest } from "../utils/api.js";
import { useSessionStore } from "../stores/session.js";
import { uploadMultipleImages, testImageService } from "../services/imageService.js";
import GoogleMap from "../components/GoogleMap.vue";

export default {
  name: "FindHousing",
  components: {
    GoogleMap
  },
  setup() {
    const sessionStore = useSessionStore();
    const listingsData = ref([]);
    const savedItemIds = ref(new Set());
    const savedItemsMap = ref(new Map()); // Map of itemId -> {tags: []}
    const loading = ref(true);
    const error = ref("");
    const showCreateModal = ref(false);
    const creating = ref(false);
    const createError = ref("");
    const isSendingInterest = ref({}); // Track loading state per listing ID
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
      photos: [], // Array of Imgur URLs for edit
    });

    // Filter state
    const filters = ref({
      minPrice: null,
      maxPrice: null,
      startDate: "",
      endDate: "",
    });

    const appliedFilters = ref({
      minPrice: null,
      maxPrice: null,
      startDate: "",
      endDate: "",
    });

    // Expanded view state
    const expandedListing = ref(null);

    // Map view state
    const showMapView = ref(false);

    // Places Autocomplete - New API
    const addressInput = ref(null);
    const geocodedLocation = ref(null);
    const editGeocodedLocation = ref(null);
    const autocompleteSuggestions = ref([]);
    const editAutocompleteSuggestions = ref([]);
    const showSuggestions = ref(false);
    const showEditSuggestions = ref(false);
    let sessionToken = null;
    let editSessionToken = null;

    // Computed property for filtered listings
    const filteredListings = computed(() => {
      let result = [...listingsData.value];

      // Apply price filters
      if (
        appliedFilters.value.minPrice !== null &&
        appliedFilters.value.minPrice !== ""
      ) {
        result = result.filter(
          (listing) => listing.price >= appliedFilters.value.minPrice
        );
      }

      if (
        appliedFilters.value.maxPrice !== null &&
        appliedFilters.value.maxPrice !== ""
      ) {
        result = result.filter(
          (listing) => listing.price <= appliedFilters.value.maxPrice
        );
      }

      // Apply date filters
      if (appliedFilters.value.startDate) {
        const filterStartDate = new Date(appliedFilters.value.startDate);
        result = result.filter((listing) => {
          const listingEndDate = new Date(listing.endDate);
          // Listing should be available at or after the filter start date
          return listingEndDate >= filterStartDate;
        });
      }

      if (appliedFilters.value.endDate) {
        const filterEndDate = new Date(appliedFilters.value.endDate);
        result = result.filter((listing) => {
          const listingStartDate = new Date(listing.startDate);
          // Listing should be available at or before the filter end date
          return listingStartDate <= filterEndDate;
        });
      }

      return result;
    });

    // Computed property for map markers from filtered listings
    const mapMarkers = computed(() => {
      const markers = filteredListings.value
        .filter(listing => listing.latitude && listing.longitude)
        .map(listing => ({
          lat: listing.latitude,
          lng: listing.longitude,
          title: listing.title,
          listing: listing
        }));
      
      console.log('[FindHousing] mapMarkers computed:', {
        totalListings: filteredListings.value.length,
        listingsWithCoords: markers.length,
        markers: markers
      });
      
      return markers;
    });

    const applyFilters = () => {
      console.log('[FindHousing] Applying filters:', filters.value);
      appliedFilters.value = {
        minPrice: filters.value.minPrice,
        maxPrice: filters.value.maxPrice,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
      };
      console.log('[FindHousing] Applied filters:', appliedFilters.value);
      console.log('[FindHousing] Filtered listings count:', filteredListings.value.length);
    };

    const clearFilters = () => {
      filters.value = {
        minPrice: null,
        maxPrice: null,
        startDate: "",
        endDate: "",
      };
      appliedFilters.value = {
        minPrice: null,
        maxPrice: null,
        startDate: "",
        endDate: "",
      };
    };

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
        // console.log("[FindHousing] No token or user, skipping user ID fetch");
        return;
      }

      const currentUserId = sessionStore.user?.id;
      if (!currentUserId || !isUUID(currentUserId)) {
        // console.log(
        //   "[FindHousing] User ID looks invalid (username?), fetching real ID:",
        //   currentUserId
        // );
        try {
          const userInfoResult = await userInfoApi.getUserInfo();
          // console.log("[FindHousing] Fetched user info:", userInfoResult);
          if (
            userInfoResult &&
            userInfoResult.user &&
            isUUID(userInfoResult.user)
          ) {
            console.log(
              "[FindHousing] Updating session store with real user ID:",
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
          }
        } catch (err) {
          console.error("[FindHousing] Failed to fetch user info:", err);
        }
      } else {
        // console.log("[FindHousing] User ID looks valid (UUID):", currentUserId);
      }
    };

    // Debug: Log session store state on setup
    // console.log("[FindHousing] Setup - Session Store State:", {
    //   hasToken: !!sessionStore.token,
    //   token: sessionStore.token,
    //   hasUser: !!sessionStore.user,
    //   user: sessionStore.user,
    //   userId: sessionStore.user?.id,
    //   userType: typeof sessionStore.user?.id,
    // });

    const newListing = ref({
      title: "",
      address: "",
      startDate: "",
      endDate: "",
      price: "",
      type: "",
      description: "",
      amenities: [],
      photos: [], // Array of Imgur URLs
    });

    // Photo upload handling
    const selectedPhotos = ref([]);
    const uploading = ref(false);
    const photoInput = ref(null);

    // Edit photo upload handling
    const editSelectedPhotos = ref([]);
    const editUploading = ref(false);
    const editPhotoInput = ref(null);

    const addAmenity = () => {
      newListing.value.amenities.push({
        title: "",
        distance: "",
      });
    };

    const removeAmenity = (index) => {
      newListing.value.amenities.splice(index, 1);
    };

    // Photo handling functions
    const triggerPhotoSelect = () => {
      if (photoInput.value) {
        photoInput.value.click();
      }
    };

    const handlePhotoSelect = (event) => {
      const files = Array.from(event.target.files);
      const maxPhotos = 5;
      const currentTotal = newListing.value.photos.length + selectedPhotos.value.length;

      if (currentTotal + files.length > maxPhotos) {
        alert(`You can only upload up to ${maxPhotos} photos total. Currently you have ${currentTotal} photos.`);
        return;
      }

      files.forEach(file => {
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          selectedPhotos.value.push({
            file: file,
            preview: e.target.result,
            uploading: false,
            error: null
          });
        };
        reader.readAsDataURL(file);
      });

      // Clear the input
      event.target.value = '';
    };

    const removeSelectedPhoto = (index) => {
      selectedPhotos.value.splice(index, 1);
    };

    const removeUploadedPhoto = (index) => {
      newListing.value.photos.splice(index, 1);
    };

    const uploadSelectedPhotos = async () => {
      if (selectedPhotos.value.length === 0) return;

      uploading.value = true;

      try {
        // Mark all as uploading
        selectedPhotos.value.forEach(photo => {
          photo.uploading = true;
          photo.error = null;
        });

        // Upload images to Cloudinary
        const files = selectedPhotos.value.map(photo => photo.file);
        console.log('Starting upload of', files.length, 'files');

        const uploadedUrls = await uploadMultipleImages(files);
        console.log('Upload completed, received URLs:', uploadedUrls);

        // Convert URLs to photo objects for consistent display
        const photoObjects = uploadedUrls.map(url => ({
          url: url,
          thumbUrl: url,
          storageKey: url.split('/').pop() || 'unknown',
          alt: "Housing listing photo",
          width: 1200,
          height: 800,
          contentType: url.includes('.png') ? "image/png" : "image/jpeg",
          bytes: 500000
        }));

        // Add photo objects to listing
        newListing.value.photos.push(...photoObjects);
        console.log('Photos added to listing, total photos now:', newListing.value.photos.length);

        // Clear selected photos
        selectedPhotos.value = [];

      } catch (error) {
        console.error('Photo upload error:', error);
        // Mark error on selected photos
        selectedPhotos.value.forEach(photo => {
          photo.uploading = false;
          photo.error = error.message || 'Upload failed';
        });
        alert(`Failed to upload photos: ${error.message || 'Unknown error'}. Please try again.`);
      } finally {
        uploading.value = false;
      }
    };

    // Test image hosting connection
    const testImageServiceWrapper = async () => {
      try {
        console.log('Testing image hosting services...');
        const result = await testImageService();
        alert(`✅ Photo upload is working!\n\nService: ${result.service}\nCloud Name: ${result.cloudName}\n\nYou can now upload photos successfully.`);
      } catch (error) {
        console.error('Image hosting test failed:', error);
        alert(`❌ Photo upload test failed: ${error.message}\n\nPlease try again later or check your internet connection.`);
      }
    };

    // Edit photo handling functions
    const triggerEditPhotoSelect = () => {
      if (editPhotoInput.value) {
        editPhotoInput.value.click();
      }
    };

    const handleEditPhotoSelect = (event) => {
      const files = Array.from(event.target.files);
      const maxPhotos = 5;
      const currentTotal = editForm.value.photos.length + editSelectedPhotos.value.length;

      if (currentTotal + files.length > maxPhotos) {
        alert(`You can only upload up to ${maxPhotos} photos total. Currently you have ${currentTotal} photos.`);
        return;
      }

      files.forEach(file => {
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          editSelectedPhotos.value.push({
            file: file,
            preview: e.target.result,
            uploading: false,
            error: null
          });
        };
        reader.readAsDataURL(file);
      });

      // Clear the input
      event.target.value = '';
    };

    const removeEditSelectedPhoto = (index) => {
      editSelectedPhotos.value.splice(index, 1);
    };

    const removeEditUploadedPhoto = (index) => {
      editForm.value.photos.splice(index, 1);
    };

    const uploadEditSelectedPhotos = async () => {
      if (editSelectedPhotos.value.length === 0) return;

      editUploading.value = true;

      try {
        // Mark all as uploading
        editSelectedPhotos.value.forEach(photo => {
          photo.uploading = true;
          photo.error = null;
        });

        // Upload files
        const files = editSelectedPhotos.value.map(photo => photo.file);
        console.log('Starting edit upload of', files.length, 'files');

        const uploadedUrls = await uploadMultipleImages(files);
        console.log('Edit upload completed, received URLs:', uploadedUrls);

        // Convert URLs to photo objects for consistent display
        const photoObjects = uploadedUrls.map(url => ({
          url: url,
          thumbUrl: url,
          storageKey: url.split('/').pop() || 'unknown',
          alt: "Housing listing photo",
          width: 1200,
          height: 800,
          contentType: url.includes('.png') ? "image/png" : "image/jpeg",
          bytes: 500000
        }));

        // Add photo objects to edit form
        editForm.value.photos.push(...photoObjects);
        console.log('Photos added to edit form, total photos now:', editForm.value.photos.length);

        // Clear selected photos
        editSelectedPhotos.value = [];

      } catch (error) {
        console.error('Edit photo upload error:', error);
        // Mark error on selected photos
        editSelectedPhotos.value.forEach(photo => {
          photo.uploading = false;
          photo.error = error.message || 'Upload failed';
        });
        alert(`Failed to upload photos: ${error.message || 'Unknown error'}. Please try again.`);
      } finally {
        editUploading.value = false;
      }
    };

    /**
     * Load Google Maps API if not already loaded
     */
    const ensureGoogleMapsLoaded = async () => {
      // Check if already loaded and initialized
      if (window.google?.maps?.places?.AutocompleteSuggestion) {
        console.log('Google Maps API already loaded');
        return true;
      }

      try {
        const response = await apiRequest('/config/mapsKey', {});
        const apiKey = response.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          console.error('Google Maps API key not available for autocomplete');
          return false;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        
        if (!existingScript) {
          console.log('Loading Google Maps API...');
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=Function.prototype`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
              console.log('Google Maps script loaded');
              resolve();
            };
            script.onerror = (error) => {
              console.error('Failed to load Google Maps script:', error);
              reject(error);
            };
            document.head.appendChild(script);
          });
        }

        // Wait for API to be available
        let retries = 0;
        while (retries < 50) {
          if (window.google?.maps?.places?.AutocompleteSuggestion) {
            console.log('Google Maps API ready');
            return true;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        console.error('Google Maps API failed to initialize after waiting');
        return false;
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        return false;
      }
    };

    /**
     * Fetch autocomplete suggestions using the new API
     */
    const fetchAutocompleteSuggestions = async (input, isEditMode = false) => {
      console.log('fetchAutocompleteSuggestions called with input:', input, 'isEditMode:', isEditMode);
      
      if (!input || input.length < 2) {
        console.log('Input too short, clearing suggestions');
        if (isEditMode) {
          editAutocompleteSuggestions.value = [];
          showEditSuggestions.value = false;
        } else {
          autocompleteSuggestions.value = [];
          showSuggestions.value = false;
        }
        return;
      }

      try {
        console.log('Ensuring Google Maps is loaded...');
        const isLoaded = await ensureGoogleMapsLoaded();
        if (!isLoaded) {
          console.error('Failed to load Google Maps API');
          return;
        }
        
        console.log('Google Maps loaded, checking API availability...');
        if (!google.maps.places.AutocompleteSuggestion) {
          console.error('AutocompleteSuggestion not available');
          return;
        }

        // Create session token if not exists
        if (isEditMode) {
          if (!editSessionToken) {
            console.log('Creating edit session token');
            editSessionToken = new google.maps.places.AutocompleteSessionToken();
          }
        } else {
          if (!sessionToken) {
            console.log('Creating session token');
            sessionToken = new google.maps.places.AutocompleteSessionToken();
          }
        }

        const request = {
          input: input,
          sessionToken: isEditMode ? editSessionToken : sessionToken,
          locationBias: {
            // Bias towards Cambridge, MA area
            west: -71.15,
            north: 42.40,
            east: -71.05,
            south: 42.35,
          },
        };

        console.log('Fetching autocomplete suggestions with request:', request);
        const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        console.log('Autocomplete API response:', { suggestions, count: suggestions?.length });
        
        if (suggestions && suggestions.length > 0) {
          const first = suggestions[0];
          console.log('First suggestion structure:', first);
          
          // Check if it has a placePrediction property
          if (first.placePrediction) {
            console.log('Has placePrediction property');
            const pred = first.placePrediction;
            
            // Try to log text via toString or valueOf
            console.log('placePrediction.text:', pred.text);
            console.log('placePrediction.text type:', typeof pred.text);
            
            if (pred.text && typeof pred.text === 'object') {
              console.log('text.toString():', pred.text.toString());
              console.log('text keys:', Object.keys(pred.text));
            }
            
            console.log('placePrediction.structuredFormat:', pred.structuredFormat);
            if (pred.structuredFormat?.mainText) {
              console.log('mainText:', pred.structuredFormat.mainText);
              console.log('mainText type:', typeof pred.structuredFormat.mainText);
              if (typeof pred.structuredFormat.mainText === 'object') {
                console.log('mainText.toString():', pred.structuredFormat.mainText.toString());
              }
            }
          }
        }

        if (isEditMode) {
          // Extract text immediately before Vue wraps the objects
          editAutocompleteSuggestions.value = suggestions.map(s => {
            const prediction = s.placePrediction;
            let displayText = 'Unknown location';
            
            try {
              if (prediction && prediction.text) {
                displayText = String(prediction.text);
              }
            } catch (e) {
              console.log('Error extracting text:', e.message);
            }
            
            return {
              displayText: displayText,
              placePrediction: prediction,
              rawSuggestion: s
            };
          });
          showEditSuggestions.value = suggestions && suggestions.length > 0;
          console.log('Edit suggestions set:', editAutocompleteSuggestions.value.length, 'Show:', showEditSuggestions.value);
        } else {
          // Extract text immediately before Vue wraps the objects
          autocompleteSuggestions.value = suggestions.map(s => {
            const prediction = s.placePrediction;
            let displayText = 'Unknown location';
            
            try {
              if (prediction && prediction.text) {
                displayText = String(prediction.text);
              }
            } catch (e) {
              console.log('Error extracting text:', e.message);
            }
            
            return {
              displayText: displayText,
              placePrediction: prediction,
              rawSuggestion: s
            };
          });
          showSuggestions.value = suggestions && suggestions.length > 0;
          console.log('Create suggestions set:', autocompleteSuggestions.value.length, 'Show:', showSuggestions.value);
        }
      } catch (err) {
        console.error('Error fetching autocomplete suggestions:', err, err.stack);
        if (isEditMode) {
          editAutocompleteSuggestions.value = [];
          showEditSuggestions.value = false;
        } else {
          autocompleteSuggestions.value = [];
          showSuggestions.value = false;
        }
      }
    };

    /**
     * Handle address input changes
     */
    const handleAddressInput = (event) => {
      const input = event.target.value;
      newListing.value.address = input;
      fetchAutocompleteSuggestions(input, false);
    };

    /**
     * Handle edit address input changes
     */
    const handleEditAddressInput = (event) => {
      const input = event.target.value;
      editForm.value.address = input;
      fetchAutocompleteSuggestions(input, true);
    };

    /**
     * Handle blur events for autocomplete
     */
    const handleAddressBlur = () => {
      setTimeout(() => {
        showSuggestions.value = false;
      }, 200);
    };

    const handleEditAddressBlur = () => {
      setTimeout(() => {
        showEditSuggestions.value = false;
      }, 200);
    };

    /**
     * Get suggestion display text safely
     */
    const getSuggestionText = (suggestion) => {
      if (!suggestion) {
        return '';
      }
      
      // We now cache displayText directly in the suggestion object
      if (suggestion.displayText) {
        return suggestion.displayText;
      }
      
      return 'Unknown location';
    };

    /**
     * Select a suggestion and fetch full place details
     */
    const selectSuggestion = async (suggestion, isEditMode = false) => {
      try {
        if (!suggestion) {
          console.error('Invalid suggestion object:', suggestion);
          return;
        }

        console.log('Selecting suggestion:', suggestion);
        
        // Get the actual prediction from our wrapper
        const prediction = suggestion.placePrediction || suggestion.rawSuggestion || suggestion;
        console.log('Using prediction for toPlace:', prediction);
        
        // The prediction should have a toPlace() method
        let place;
        if (typeof prediction.toPlace === 'function') {
          place = prediction.toPlace();
        } else {
          console.error('Prediction does not have toPlace method:', prediction);
          console.error('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(prediction)));
          return;
        }
        
        console.log('Place object created:', place);
        
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });

        console.log('Place fields fetched:', place);

        if (!place.location) {
          console.error('Place has no location data:', place);
          return;
        }

        const lat = place.location.lat();
        const lng = place.location.lng();
        const address = place.formattedAddress || place.displayName;

        if (isEditMode) {
          editGeocodedLocation.value = {
            latitude: lat,
            longitude: lng,
            address: address
          };
          editForm.value.address = address;
          showEditSuggestions.value = false;
          editAutocompleteSuggestions.value = [];
          // Reset session token after selection
          editSessionToken = null;
        } else {
          geocodedLocation.value = {
            latitude: lat,
            longitude: lng,
            address: address
          };
          newListing.value.address = address;
          showSuggestions.value = false;
          autocompleteSuggestions.value = [];
          // Reset session token after selection
          sessionToken = null;
        }

        console.log('Place selected:', {
          address: address,
          lat: lat,
          lng: lng
        });
      } catch (err) {
        console.error('Error selecting place:', err);
      }
    };



    /**
     * Geocode an address to get lat/lng coordinates
     */
    const geocodeAddress = async (address) => {
      try {
        // Check if Google Maps is already loaded
        if (!window.google || !window.google.maps) {
          const response = await apiRequest('/config/mapsKey', {});
          const apiKey = response.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          
          if (!apiKey) {
            console.warn('Cannot geocode: API key not available');
            return null;
          }

          // Load script if not already loaded
          if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&v=weekly`;
              script.async = true;
              script.defer = true;
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          // Wait for Google Maps to be available
          let retries = 0;
          while ((!window.google || !window.google.maps) && retries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
          }
        }

        const geocoder = new google.maps.Geocoder();

        return new Promise((resolve) => {
          geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              resolve({
                latitude: location.lat(),
                longitude: location.lng(),
                address: results[0].formatted_address
              });
            } else {
              console.warn('Geocoding failed:', status);
              resolve(null);
            }
          });
        });
      } catch (err) {
        console.error('Error geocoding address:', err);
        return null;
      }
    };

    const fetchListings = async () => {
      loading.value = true;
      error.value = "";
      try {
        const result = await listings.getAll();
        // console.log("[FindHousing] Fetched listings:", result);
        // console.log("[FindHousing] Number of listings:", result?.length || 0);

        // Debug: Log each listing's lister ID and coordinates
        if (result && Array.isArray(result)) {
          const listingsWithCoords = result.filter(l => l.latitude && l.longitude);
          console.log(`[FindHousing] Listings with coordinates: ${listingsWithCoords.length}/${result.length}`);
          
          result.forEach((listing, index) => {
            console.log(`[FindHousing] Listing ${index}:`, {
              _id: listing._id,
              title: listing.title,
              lister: listing.lister,
              listerType: typeof listing.lister,
              hasCoords: !!(listing.latitude && listing.longitude),
              lat: listing.latitude,
              lng: listing.longitude,
            });
          });
        }

        // Sort listings by _id in descending order (newest first)
        // MongoDB ObjectIds contain timestamps, so newer listings have higher _id values
        if (result && Array.isArray(result)) {
          result.sort((a, b) => {
            // Compare _id strings in descending order (newest first)
            if (a._id > b._id) return -1;
            if (a._id < b._id) return 1;
            return 0;
          });
        }

        listingsData.value = result;

        // Debug: After setting listings, check ownership
        console.log(
          "[FindHousing] Current user ID from session:",
          sessionStore.user?.id
        );
        if (result && Array.isArray(result) && sessionStore.user?.id) {
          result.forEach((listing) => {
            const isOwnerResult = isOwner(listing);
            console.log(
              `[FindHousing] Listing "${listing.title}" (${listing._id}) isOwner:`,
              isOwnerResult
            );
          });
        }
      } catch (err) {
        error.value = err.message || "Failed to load listings";
      } finally {
        loading.value = false;
      }
    };

    const fetchSavedItems = async () => {
      if (!sessionStore.user || !sessionStore.user.id) {
        // console.log("No user logged in, skipping fetchSavedItems");
        return;
      }

      try {
        // console.log("Fetching saved items for user:", sessionStore.user.id);
        const result = await savedItems.getSavedItems(sessionStore.user.id);
        // console.log("Raw saved items result:", result);
        const items = result?.results || result;
        console.log(
          "Items to process:",
          items,
          "Is array:",
          Array.isArray(items)
        );

        if (items && Array.isArray(items)) {
          // Build both the IDs set and the tags map
          const ids = [];
          const tagsMap = new Map();

          items.forEach((saved) => {
              console.log(
                "Processing saved item:",
                JSON.stringify(saved, null, 2)
              );
              // API returns: {user: "...", savedItem: {item: "id", tags: [...]}}
              if (saved.savedItem && saved.savedItem.item) {
              const itemId = saved.savedItem.item;
              const tags = saved.savedItem.tags || [];
              console.log(`Found itemId: ${itemId}, tags:`, tags);

              if (!ids.includes(itemId)) {
                ids.push(itemId);
              }

              // Merge tags if item already exists in map
              if (tagsMap.has(itemId)) {
                const existingTags = tagsMap.get(itemId).tags;
                const mergedTags = [...new Set([...existingTags, ...tags])];
                tagsMap.set(itemId, { tags: mergedTags });
              } else {
                tagsMap.set(itemId, { tags: tags });
              }
              } else if (saved._id) {
              const itemId = saved._id;
              console.log("Using saved._id:", itemId);
              if (!ids.includes(itemId)) {
                ids.push(itemId);
              }
              if (!tagsMap.has(itemId)) {
                tagsMap.set(itemId, { tags: [] });
              }
              } else if (saved.item && saved.item.item) {
              const itemId = saved.item.item;
              console.log("Using saved.item.item:", itemId);
              if (!ids.includes(itemId)) {
                ids.push(itemId);
              }
              if (!tagsMap.has(itemId)) {
                tagsMap.set(itemId, { tags: saved.item.tags || [] });
              }
            }
          });

          savedItemIds.value = new Set(ids);
          savedItemsMap.value = tagsMap;
          console.log("Saved item IDs set to:", Array.from(savedItemIds.value));
          console.log("Tags map:", Array.from(tagsMap.entries()));
        } else {
          console.log("Result is not an array, clearing saved items");
          savedItemIds.value = new Set();
          savedItemsMap.value = new Map();
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

    // Removed incorrect getCurrentUser implementation. Use PasswordAuth endpoints for user info.

    const isOwner = (listing) => {
      console.log("[FindHousing] isOwner called for listing:", {
        listingId: listing._id,
        listingTitle: listing.title,
        listingLister: listing.lister,
        listingListerType: typeof listing.lister,
      });

      console.log("[FindHousing] Session store user:", {
        hasUser: !!sessionStore.user,
        user: sessionStore.user,
        userId: sessionStore.user?.id,
        userIdType: typeof sessionStore.user?.id,
        userUser: sessionStore.user?.user,
      });

      if (!sessionStore.user || !sessionStore.user.id) {
        console.log(
          "[FindHousing] isOwner: No user in session store - returning false"
        );
        return false;
      }

      const userId = sessionStore.user.id || sessionStore.user.user;
      console.log("[FindHousing] Comparing IDs:", {
        listingLister: listing.lister,
        listingListerType: typeof listing.lister,
        userId: userId,
        userIdType: typeof userId,
        areEqual: listing.lister === userId,
        strictEqual: listing.lister === userId,
      });

      const isOwnerResult = listing.lister === userId;
      console.log("[FindHousing] isOwner result:", isOwnerResult);

      return isOwnerResult;
    };

    // Helper functions
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

    const toggleListingDetails = (listingId) => {
      if (expandedListing.value === listingId) {
        expandedListing.value = null;
      } else {
        expandedListing.value = listingId;
      }
    };

    const closeListing = () => {
      expandedListing.value = null;
    };

    const handleMapMarkerClick = (markerData) => {
      if (markerData.listing) {
        expandedListing.value = markerData.listing._id;
      }
    };

    const getExpandedListing = () => {
      return listingsData.value.find(listing => listing._id === expandedListing.value) || {};
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const handleCreateListing = async () => {
      creating.value = true;
      createError.value = "";

      console.log("Creating listing with data:", newListing.value);
      console.log(
        "Full newListing object:",
        JSON.stringify(newListing.value, null, 2)
      );
      console.log(
        "Raw type:",
        newListing.value.type,
        "Raw description:",
        newListing.value.description,
        "Type of description:",
        typeof newListing.value.description
      );

      // Validate required fields
      if (!newListing.value.type || newListing.value.type === "") {
        createError.value = "Please select a listing type (sublet or renting)";
        creating.value = false;
        return;
      }

      try {
        // Filter out empty amenities and format them properly
        // Only require title, distance is optional
        const validAmenities = newListing.value.amenities
          .filter((a) => a.title && a.title.trim() !== "")
          .map((a) => ({
            title: a.title,
            distance: a.distance !== "" && a.distance !== null && a.distance !== undefined
              ? Number(a.distance)
              : 0,
          }));

        console.log("Valid amenities:", validAmenities);

        // Ensure type and description are strings, not null/undefined
        // Convert to string explicitly to handle any edge cases
        const typeValue = String(newListing.value.type || "").trim();
        // Handle description the same way as edit does
        const descriptionValue = newListing.value.description || "";

        if (typeValue !== "sublet" && typeValue !== "renting") {
          createError.value =
            "Invalid listing type. Please select 'sublet' or 'renting'";
          creating.value = false;
          return;
        }

        // Ensure all photos are in object format for backend create function
        const photoObjects = (newListing.value.photos || []).map(photo => {
          if (typeof photo === 'string') {
            // Convert string URL to photo object
            return {
              url: photo,
              thumbUrl: photo,
              storageKey: photo.split('/').pop() || 'unknown',
              alt: "Housing listing photo",
              width: 1200,
              height: 800,
              contentType: photo.includes('.png') ? "image/png" : "image/jpeg",
              bytes: 500000
            };
          }
          return photo; // Already an object
        });

        console.log('📷 Final photo objects for create:', {
          totalPhotos: photoObjects.length,
          photos: photoObjects,
          samplePhoto: photoObjects[0]
        });

        // Geocode address if not already geocoded
        let latitude = null;
        let longitude = null;
        
        if (geocodedLocation.value) {
          latitude = geocodedLocation.value.latitude;
          longitude = geocodedLocation.value.longitude;
        } else if (newListing.value.address) {
          // Try to geocode the manually entered address
          const geocoded = await geocodeAddress(newListing.value.address);
          if (geocoded) {
            latitude = geocoded.latitude;
            longitude = geocoded.longitude;
          }
        }

        const result = await listings.create(
          newListing.value.title,
          validAmenities,
          photoObjects, // Send photo objects to create function
          newListing.value.address,
          newListing.value.startDate,
          newListing.value.endDate,
          newListing.value.price,
          typeValue,
          descriptionValue,
          latitude,
          longitude
        );

        console.log("Listing created successfully:", result);
        console.log("📷 Photos in created listing:", result?.photos);

        // Reset form and close modal
        newListing.value = {
          title: "",
          address: "",
          startDate: "",
          endDate: "",
          price: "",
          type: "",
          description: "",
          amenities: [],
          photos: [],
        };
        // Clear photo states
        selectedPhotos.value = [];
        uploading.value = false;
        geocodedLocation.value = null;
        showCreateModal.value = false;

        // Refresh listings
        await fetchListings();
      } catch (err) {
        console.error("Create listing error:", err);
        createError.value = err.message || "Failed to create listing";
      } finally {
        creating.value = false;
      }
    };

    const deleteListing = async (listingId) => {
      if (!confirm("Are you sure you want to delete this listing?")) {
        return;
      }

      try {
        await listings.delete(listingId);
        await fetchListings();
      } catch (err) {
        alert("Failed to delete listing: " + (err.message || "Unknown error"));
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
        type: listing.type || "",
        description: listing.description || "",
        amenities: listing.amenities
          ? listing.amenities.map((a) => ({
              _id: a._id,
              title: a.title || "",
              distance: a.distance || "",
            }))
          : [],
        photos: listing.photos ? [...listing.photos] : [], // Copy existing photos
      };
      // Clear any pending edit photo uploads
      editSelectedPhotos.value = [];
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
        photos: [],
      };
      // Clear edit photo states
      editSelectedPhotos.value = [];
      editUploading.value = false;
      editGeocodedLocation.value = null;
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
      if (!editingListingId.value) {
        editError.value = "No listing selected for editing.";
        return;
      }

      isEditing.value = true;
      editError.value = "";

      try {
        const listingId = editingListingId.value;
        const listing = listingsData.value.find((l) => l._id === listingId);
        if (!listing) {
          editError.value = "Listing not found";
          return;
        }

        // Compare current form data with original listing data and send updates only for changed fields
        if (editForm.value.title !== listing.title) {
          await listings.editTitle(listingId, editForm.value.title);
        }
        if (editForm.value.address !== listing.address) {
          let latitude = null;
          let longitude = null;
          
          if (editGeocodedLocation.value) {
            latitude = editGeocodedLocation.value.latitude;
            longitude = editGeocodedLocation.value.longitude;
          } else if (editForm.value.address) {
            const geocoded = await geocodeAddress(editForm.value.address);
            if (geocoded) {
              latitude = geocoded.latitude;
              longitude = geocoded.longitude;
            }
          }
          
          await listings.editAddress(listingId, editForm.value.address, latitude, longitude);
        }
        if (
          formatDateForInput(listing.startDate) !== editForm.value.startDate
        ) {
          await listings.editStartDate(listingId, editForm.value.startDate);
        }
        if (formatDateForInput(listing.endDate) !== editForm.value.endDate) {
          await listings.editEndDate(listingId, editForm.value.endDate);
        }
        if (editForm.value.price !== listing.price) {
          await listings.editPrice(listingId, editForm.value.price);
        }
        if (editForm.value.type !== listing.type) {
          await listings.editType(listingId, editForm.value.type);
        }
        const currentDescription = listing.description || "";
        const newDescription = editForm.value.description || "";
        if (newDescription !== currentDescription) {
          await listings.editDescription(listingId, newDescription);
        }

        // Handle amenities: deleted, new, and updated
        // Only require title, distance is optional
        const oldAmenities = listing.amenities || [];
        const newAmenities = editForm.value.amenities.filter(
          (a) => a.title && a.title.trim() !== ""
        );

        // Delete amenities that were removed
        for (const oldAmenity of oldAmenities) {
          const stillExists = newAmenities.some(
            (newA) =>
              newA._id === oldAmenity._id &&
              newA.title === oldAmenity.title &&
              newA.distance === oldAmenity.distance
          );
          if (!stillExists && oldAmenity._id) {
            await listings.deleteAmenity(listingId, oldAmenity._id);
          }
        }

        // Add new amenities or update existing ones if changed
        for (const newAmenity of newAmenities) {
          // If it doesn't have an _id, it's a new amenity
          if (!newAmenity._id && newAmenity.title) {
            const distance = newAmenity.distance !== "" &&
                           newAmenity.distance !== null &&
                           newAmenity.distance !== undefined
              ? Number(newAmenity.distance)
              : 0;
            await listings.addAmenity(
              listingId,
              newAmenity.title,
              distance
            );
          }
          // If it has an _id but values changed, delete old and add new
          else if (newAmenity._id) {
            const oldAmenity = oldAmenities.find(
              (a) => a._id === newAmenity._id
            );
            const newDistance = newAmenity.distance !== "" &&
                               newAmenity.distance !== null &&
                               newAmenity.distance !== undefined
              ? Number(newAmenity.distance)
              : 0;
            if (
              oldAmenity &&
              (oldAmenity.title !== newAmenity.title ||
                oldAmenity.distance !== newDistance)
            ) {
              await listings.deleteAmenity(listingId, newAmenity._id);
              if (newAmenity.title) {
                await listings.addAmenity(
                  listingId,
                  newAmenity.title,
                  newDistance
                );
              }
            }
          }
        }

        // Handle photos: compare original with edited
        const originalPhotos = listing.photos || [];
        const editedPhotos = editForm.value.photos || [];

        // Extract URLs for comparison (handle both string and object formats)
        const getPhotoUrl = (photo) => typeof photo === 'string' ? photo : photo.url;
        const originalUrls = originalPhotos.map(getPhotoUrl);
        const editedUrls = editedPhotos.map(getPhotoUrl);

        // Find photos that were removed (exist in original but not in edited)
        for (const originalPhoto of originalPhotos) {
          const originalUrl = getPhotoUrl(originalPhoto);
          if (!editedUrls.includes(originalUrl)) {
            // Photo was removed - need to delete it
            try {
              const photoId = typeof originalPhoto === 'string' ? null : originalPhoto._id;
              if (photoId) {
                console.log('🗑️ Deleting photo:', { listingId, photoId, url: originalUrl });
                await listings.deletePhoto(listingId, photoId);
              } else {
                console.warn("Cannot delete photo: no photo ID available for URL:", originalUrl);
              }
            } catch (photoError) {
              console.error("Could not delete photo:", originalUrl, photoError);
            }
          }
        }

        // Find photos that were added (exist in edited but not in original)
        for (const editedPhoto of editedPhotos) {
          const editedUrl = getPhotoUrl(editedPhoto);
          if (!originalUrls.includes(editedUrl)) {
            // Photo was added - need to add it
            try {
              console.log('🖼️ Adding photo to listing:', { listingId, photoUrl: editedUrl });
              await listings.addPhoto(listingId, editedUrl);
            } catch (photoError) {
              console.error("Could not add photo:", editedPhoto, photoError);
            }
          }
        }

        // Refresh listings to get updated data
        await fetchListings();
        closeEditModal();
      } catch (err) {
        console.error("[FindHousing] Error editing listing:", err);
        editError.value = err.message || "Failed to update listing";
      } finally {
        isEditing.value = false;
      }
    };

    const sendInterest = async (listingId) => {
      if (!sessionStore.user || !sessionStore.user.id) {
        alert("Please log in to send interest");
        return;
      }

      // Set loading state for this specific listing
      isSendingInterest.value[listingId] = true;

      try {
        console.log("Sending interest for listing:", listingId);
        const result = await listings.sendInterest(listingId);
        console.log("Interest sent successfully:", result);
        alert("Your interest has been sent to the listing owner!");

        // Refetch saved items to update local state
        await fetchSavedItems();
      } catch (err) {
        console.error("Error sending interest:", err);
        alert("Failed to send interest: " + (err.message || "Unknown error"));
      } finally {
        // Clear loading state for this specific listing
        isSendingInterest.value[listingId] = false;
      }
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
      createError.value = "";
      newListing.value = {
        title: "",
        address: "",
        startDate: "",
        endDate: "",
        price: "",
        type: "",
        description: "",
        amenities: [],
        photos: [],
      };
      // Clear photo states
      selectedPhotos.value = [];
      uploading.value = false;
    };

    const route = useRoute();

    onMounted(async () => {
      console.log("[FindHousing] Component mounted");
      console.log("[FindHousing] Session store on mount:", {
        token: sessionStore.token,
        user: sessionStore.user,
        userId: sessionStore.user?.id,
      });

      // Ensure we have a valid user ID before fetching listings
      await ensureValidUserId();

      fetchListings();
      fetchSavedItems();
    });

    // Watch for route changes to refetch saved items when returning to this page
    watch(
      () => route.path,
      (newPath) => {
        if (newPath === "/home") {
          console.log("Navigated to Find Housing - refetching saved items");
          fetchSavedItems();
        }
      }
    );



    return {
      listings: listingsData,
      filteredListings,
      filters,
      applyFilters,
      clearFilters,
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
      isSaved,
      getItemTags,
      toggleSavedItem,
      sendInterest,
      isSendingInterest,
      showEditModal,
      isEditing,
      editError,
      editForm,
      closeEditModal,
      addEditAmenity,
      removeEditAmenity,
      handleEditListing,
      sessionStore,
      expandedListing,
      truncateText,
      getPhotoUrl,
      toggleListingDetails,
      closeListing,
      getExpandedListing,
      // Photo handling
      selectedPhotos,
      uploading,
      photoInput,
      triggerPhotoSelect,
      handlePhotoSelect,
      removeSelectedPhoto,
      removeUploadedPhoto,
      uploadSelectedPhotos,
      testImageServiceWrapper,
      // Edit photo handling
      editSelectedPhotos,
      editUploading,
      editPhotoInput,
      triggerEditPhotoSelect,
      handleEditPhotoSelect,
      removeEditSelectedPhoto,
      removeEditUploadedPhoto,
      uploadEditSelectedPhotos,
      showMapView,
      mapMarkers,
      handleMapMarkerClick,
      addressInput,
      geocodedLocation,
      autocompleteSuggestions,
      editAutocompleteSuggestions,
      showSuggestions,
      showEditSuggestions,
      handleAddressInput,
      handleEditAddressInput,
      handleAddressBlur,
      handleEditAddressBlur,
      selectSuggestion,
      getSuggestionText,
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
  margin-bottom: 1.5rem;
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

/* Filter Bar Styles */
.filter-bar {
  background: rgba(37, 62, 53, 1);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.filter-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 150px;
}

.filter-group label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.filter-group input {
  padding: 0.625rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, background 0.2s;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
}

.filter-group input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: white;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.search-btn,
.clear-btn {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s, background 0.2s;
  font-size: 1rem;
}

.search-btn {
  background: rgb(22, 53, 27);
  color: white;
}

.search-btn:hover {
  background: rgb(15, 38, 19);
  transform: translateY(-1px);
}

.clear-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.listings-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 2rem;
}

.view-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.toggle-btn {
  padding: 0.75rem 1.5rem;
  background: rgb(47, 71, 62);
  color: white;
  border: 2px solid rgb(47, 71, 62);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  font-family: Helvetica, Arial, sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-btn:hover {
  background: rgb(37, 62, 53);
  border-color: rgb(37, 62, 53);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(47, 71, 62, 0.3);
}

.toggle-btn.active {
  background: rgb(22, 53, 27);
  border-color: rgb(22, 53, 27);
  color: white;
}

.toggle-btn.active:hover {
  background: rgb(15, 38, 19);
  border-color: rgb(15, 38, 19);
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-icon {
  flex-shrink: 0;
}

.results-count {
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
}

.map-view-container {
  width: 100%;
  height: 600px;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading,
.no-listings {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
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

.address-preview {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.price-preview {
  font-size: 0.85rem;
  color: #1e5a2e;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.info-icon {
  color: #888;
  flex-shrink: 0;
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

.description-preview {
  color: #666;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
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

.owner-badge {
  background: rgb(47, 71, 62);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.listing-details {
  margin-bottom: 0.75rem;
}

.listing-details p {
  margin: 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
}

.address {
  font-size: 1rem;
}

.amenities {
  margin-top: 0.75rem;
}

.amenities ul {
  list-style: none;
  padding: 0;
  margin: 0.35rem 0 0 0;
}

.amenities li {
  padding: 0.2rem 0;
  color: #666;
  font-size: 0.9rem;
}

.interest-btn {
  width: 100%;
  background: rgb(22, 53, 27);
  color: white;
  border: none;
  padding: 0.625rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0.75rem;
  transition: background 0.2s, opacity 0.2s;
}

.interest-btn:hover:not(:disabled) {
  background: rgb(15, 38, 19);
}

.interest-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.listing-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  font-size: 0.9rem;
}

.edit-btn {
  background: rgb(22, 53, 27);
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
  color: rgb(47, 71, 62);
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
  color: rgb(47, 71, 62);
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1e5a2e;
  box-shadow: 0 0 0 3px rgba(30, 90, 46, 0.1);
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
  border-color: #1e5a2e;
  background-color: #f9f9f9;
}

.form-group select option {
  padding: 0.5rem;
}

.form-group select option:first-child {
  color: #999;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
  font-family: inherit;
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
  padding: 0.625rem 1rem;
  background: rgb(22, 53, 27);
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
  background: rgb(22, 53, 27);
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

/* Expanded Listing Detail Styles */
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

.contact-btn {
  width: 100%;
  background: rgb(22, 53, 27);
  color: white;
  border: none;
  padding: 0.625rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0.75rem;
  transition: background 0.2s, opacity 0.2s;
}

.contact-btn:hover:not(:disabled) {
  background: rgb(15, 38, 19);
}

.contact-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.contacted-message {
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  color: #666;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
}

.owner-actions {
  display: flex;
  gap: 1rem;
}

.detail-actions .edit-btn,
.detail-actions .delete-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  font-size: 0.9rem;
}

.edit-btn {
  background: rgb(22, 53, 27);
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

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s ease;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn.is-saved {
  color: #e74c3c;
}

/* Photo Upload Styles */
.photo-upload-section {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: #fafafa;
}

.photo-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.photo-preview-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.photo-preview {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.remove-photo-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.remove-photo-btn:hover {
  background: #dc3545;
}

.photo-status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  text-align: center;
}

.photo-status.uploaded {
  background: rgba(40, 167, 69, 0.9);
}

.photo-status.uploading {
  background: rgba(255, 193, 7, 0.9);
}

.photo-status.error {
  background: rgba(220, 53, 69, 0.9);
}

.photo-upload-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.photo-upload-btn,
.upload-photos-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.photo-upload-btn {
  background: #f8f9fa;
  color: #495057;
  border: 2px solid #dee2e6;
}

.photo-upload-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.upload-photos-btn {
  background: rgb(22, 53, 27);
  color: white;
}

.upload-photos-btn:hover:not(:disabled) {
  background: rgb(15, 38, 19);
}

.photo-upload-btn:disabled,
.upload-photos-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.photo-upload-info {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.photo-upload-info p {
  margin: 0;
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

.modal-photos-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.modal-photo-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: white;
}

.modal-photo {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.modal-photo:hover {
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .modal-photos-gallery {
    grid-template-columns: 1fr;
  }

  .card-photo-main {
    height: 120px;
  }

  .modal-photo {
    height: 180px;
  }
}

/* Autocomplete Suggestions Styles */
.autocomplete-wrapper {
  position: relative;
  width: 100%;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 250px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
  color: #1e5a2e;
}

.suggestion-item:active {
  background-color: #e8f5e9;
}

</style>
