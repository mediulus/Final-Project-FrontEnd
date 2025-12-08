<template>
  <main class="homepage">
    <section class="hero">
      <h2>My Postings</h2>
      <p>All your housing listings & roommate postings</p>
      <div class="button-spacer"></div>
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
                  <div class="owner-badge">Your Posting</div>
                  <button @click="editRoommatePosting(posting)" class="icon-btn edit-icon-btn" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button @click="deleteRoommatePosting(posting._id)" class="icon-btn delete-icon-btn" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="card-preview">
                <p class="description-preview">{{ truncateText(posting.aboutYourself || posting.description || "", 100) }}</p>
                <div class="expand-hint">
                  <span>Click for details</span>
                  <span class="expand-icon">+</span>
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
                  <div class="owner-badge">Your Listing</div>
                  <button @click="editListing(listing)" class="icon-btn edit-icon-btn" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button @click="deleteHousingListing(listing._id)" class="icon-btn delete-icon-btn" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="card-preview">
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
                <div class="expand-hint">
                  <span>Click for details</span>
                  <span class="expand-icon">+</span>
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
                  <td>Home Environment & Guests</td>
                  <td>{{ getExpandedPosting().homeEnvironment }}</td>
                </tr>
                <tr v-if="getExpandedPosting().housingStatus">
                  <td>Housing Status</td>
                  <td>{{ getExpandedPosting().housingStatus }}</td>
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

          <!-- Photos -->
          <div class="info-section" v-if="getExpandedListing().photos && getExpandedListing().photos.length > 0">
            <h3>Photos</h3>
            <div class="photos-grid">
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
        <div class="modal-header">
          <h2>Edit Listing</h2>
          <button @click="closeEditModal" class="close-btn">×</button>
        </div>
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
                  @click="selectSuggestion(suggestion)"
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
            <p class="amenities-description">
              Add any perks about the house, such as in-house laundry or kitchen features,
              or convenient nearby locations like grocery stores. For locations, specify
              the distance in miles from home.
            </p>
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
                  placeholder="Miles (optional)"
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

          <!-- Photo Management Section -->
          <div class="form-group">
            <label>Photos</label>

            <!-- Current Photos -->
            <div v-if="editForm.photos && editForm.photos.length > 0" class="current-photos">
              <div class="photos-grid-edit">
                <div
                  v-for="(photo, index) in editForm.photos"
                  :key="index"
                  class="photo-item-edit"
                >
                  <img :src="getPhotoUrl(photo)" :alt="'Photo ' + (index + 1)" class="photo-preview" />
                  <button
                    type="button"
                    @click="removeEditPhoto(index)"
                    class="remove-photo-btn"
                    :disabled="editUploading"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <!-- Photo Upload Section -->
            <div class="photo-upload-section">
              <input
                type="file"
                ref="editPhotoInput"
                multiple
                accept="image/*"
                @change="handleEditPhotoSelect"
                style="display: none"
              />

              <!-- Selected Photos Preview -->
              <div v-if="editSelectedPhotos && editSelectedPhotos.length > 0" class="selected-photos-preview">
                <h4>Selected Photos:</h4>
                <div class="selected-photos-grid">
                  <div v-for="(photo, index) in editSelectedPhotos" :key="index" class="selected-photo-item">
                    <img :src="photo.preview" :alt="'New photo ' + (index + 1)" class="selected-photo-preview" />
                    <div class="photo-status">
                      <span v-if="photo.uploading" class="uploading">Uploading...</span>
                      <span v-else-if="photo.error" class="error">{{ photo.error }}</span>
                      <span v-else class="ready">Ready</span>
                    </div>
                    <button
                      type="button"
                      @click="removeEditSelectedPhoto(index)"
                      class="remove-selected-photo-btn"
                      :disabled="photo.uploading"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div class="photo-upload-controls">
                <button type="button" @click="triggerEditPhotoSelect" class="photo-upload-btn" :disabled="editUploading">
                  📷 Select Photos
                </button>
                <button
                  type="button"
                  @click="uploadEditPhotos"
                  class="upload-photos-btn"
                  :disabled="!editSelectedPhotos || editSelectedPhotos.length === 0 || editUploading"
                >
                  {{ editUploading ? 'Uploading...' : 'Upload Photos' }}
                </button>
              </div>
              <p class="photo-hint">You can upload up to 5 photos total. JPG, PNG formats supported.</p>
            </div>
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
        <div class="modal-header">
          <h2>Edit Roommate Posting</h2>
          <button @click="closeEditRoommateModal" class="close-btn">×</button>
        </div>
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
              >Number of Roommates Looking For *</label
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
            <label for="edit-roommate-homeEnvironment">Home Environment *</label>
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
            <label for="edit-roommate-guestsVisitors">Guests & Visitors *</label>
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
            <label for="edit-roommate-about-yourself">Tell More About Yourself *</label>
            <textarea
              id="edit-roommate-about-yourself"
              v-model="editRoommateForm.aboutYourself"
              required
              rows="4"
              placeholder="Tell us about yourself, your interests, lifestyle, etc."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="edit-roommate-looking-for">What You Are Looking For in a Roommate *</label>
            <textarea
              id="edit-roommate-looking-for"
              v-model="editRoommateForm.lookingFor"
              required
              rows="4"
              placeholder="Describe what you're looking for in a roommate"
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
import { uploadMultipleImages } from "../services/imageService.js";
import { apiRequest } from "../utils/api.js";

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
      photos: [],
    });

    // Photo editing state
    const editPhotoInput = ref(null);
    const editSelectedPhotos = ref([]);
    const editUploading = ref(false);
    const editGeocodedLocation = ref(null);
    const editAutocompleteSuggestions = ref([]);
    const showEditSuggestions = ref(false);
    let editSessionToken = null;
    const showEditRoommateModal = ref(false);
    const isEditingRoommate = ref(false);
    const editRoommateError = ref("");
    const editingRoommatePostingId = ref(null);
    const editRoommateForm = ref({
      city: "",
      gender: "",
      age: "",
      aboutYourself: "",
      lookingFor: "",
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

    /**
     * Load Google Maps API if not already loaded
     */
    const ensureGoogleMapsLoaded = async () => {
      if (window.google?.maps?.places?.AutocompleteSuggestion) {
        return true;
      }

      try {
        const response = await apiRequest('/config/mapsKey', {});
        const apiKey = response.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          console.error('Google Maps API key not available');
          return false;
        }

        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');

        if (!existingScript) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=Function.prototype`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = (error) => reject(error);
            document.head.appendChild(script);
          });
        }

        let retries = 0;
        while (retries < 50) {
          if (window.google?.maps?.places?.AutocompleteSuggestion) {
            return true;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }

        return false;
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        return false;
      }
    };

    /**
     * Fetch autocomplete suggestions
     */
    const fetchAutocompleteSuggestions = async (input) => {
      if (!input || input.length < 2) {
        editAutocompleteSuggestions.value = [];
        showEditSuggestions.value = false;
        return;
      }

      try {
        const isLoaded = await ensureGoogleMapsLoaded();
        if (!isLoaded || !google.maps.places.AutocompleteSuggestion) {
          return;
        }

        if (!editSessionToken) {
          editSessionToken = new google.maps.places.AutocompleteSessionToken();
        }

        const request = {
          input: input,
          sessionToken: editSessionToken,
          locationBias: {
            west: -71.15,
            north: 42.40,
            east: -71.05,
            south: 42.35,
          },
        };

        const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

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
      } catch (err) {
        console.error('Error fetching autocomplete suggestions:', err);
        editAutocompleteSuggestions.value = [];
        showEditSuggestions.value = false;
      }
    };

    /**
     * Handle edit address input changes
     */
    const handleEditAddressInput = (event) => {
      const input = event.target.value;
      editForm.value.address = input;
      // Clear geocoded location when user starts typing manually
      // This ensures geocoding will run if they don't select from autocomplete
      editGeocodedLocation.value = null;
      fetchAutocompleteSuggestions(input);
    };

    /**
     * Handle blur events for autocomplete
     */
    const handleEditAddressBlur = () => {
      setTimeout(() => {
        showEditSuggestions.value = false;
      }, 200);
    };

    /**
     * Get suggestion display text safely
     */
    const getSuggestionText = (suggestion) => {
      if (!suggestion) return '';
      if (suggestion.displayText) return suggestion.displayText;
      return 'Unknown location';
    };

    /**
     * Select a suggestion and fetch full place details
     */
    const selectSuggestion = async (suggestion) => {
      try {
        if (!suggestion) return;

        const prediction = suggestion.placePrediction || suggestion.rawSuggestion || suggestion;

        let place;
        if (typeof prediction.toPlace === 'function') {
          place = prediction.toPlace();
        } else {
          console.error('Prediction does not have toPlace method');
          return;
        }

        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });

        if (!place.location) {
          console.error('Place has no location data');
          return;
        }

        const lat = place.location.lat();
        const lng = place.location.lng();
        const address = place.formattedAddress || place.displayName;

        editGeocodedLocation.value = {
          latitude: lat,
          longitude: lng,
          address: address
        };
        editForm.value.address = address;
        showEditSuggestions.value = false;
        editAutocompleteSuggestions.value = [];
        editSessionToken = null;
      } catch (err) {
        console.error('Error selecting place:', err);
      }
    };

    /**
     * Geocode an address to get lat/lng coordinates
     */
    const geocodeAddress = async (address) => {
      try {
        if (!window.google || !window.google.maps) {
          const response = await apiRequest('/config/mapsKey', {});
          const apiKey = response.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

          if (!apiKey) {
            console.warn('Cannot geocode: API key not available');
            return null;
          }

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

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const getPhotoUrl = (photo) => {
      if (!photo) return '';
      // Handle both old format (string) and new format (object with url property)
      return typeof photo === 'string' ? photo : photo.url || photo.thumbUrl || '';
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
        roommatePostings.value = allRoommateArray
          .filter(
            (posting) => posting && posting._id && posting.poster === userId
          )
          .sort((a, b) => b._id.localeCompare(a._id)); // Sort by most recent first
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
      // Handle both old (description) and new (aboutYourself/lookingFor) formats
      const aboutYourself = posting.aboutYourself || (posting.description ? posting.description.split('\n\n---\n\n')[0] : "");
      const lookingFor = posting.lookingFor || (posting.description && posting.description.includes('---') ? posting.description.split('\n\n---\n\n')[1] : "");

      editRoommateForm.value = {
        city: posting.city || "",
        gender: posting.gender || "",
        age: posting.age || "",
        aboutYourself: aboutYourself,
        lookingFor: lookingFor,
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
        aboutYourself: "",
        lookingFor: "",
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
        // Edit aboutYourself if changed (only if posting has new format)
        if (posting.aboutYourself !== undefined && editRoommateForm.value.aboutYourself !== posting.aboutYourself) {
          await roommatePostingsApi.editAboutYourself(
            userId,
            editRoommateForm.value.aboutYourself
          );
        }
        // Edit lookingFor if changed (only if posting has new format)
        if (posting.lookingFor !== undefined && editRoommateForm.value.lookingFor !== posting.lookingFor) {
          await roommatePostingsApi.editLookingFor(
            userId,
            editRoommateForm.value.lookingFor
          );
        }
        // If old format (description), update both fields to migrate to new format
        if (posting.description && !posting.aboutYourself && !posting.lookingFor) {
          await roommatePostingsApi.editAboutYourself(
            userId,
            editRoommateForm.value.aboutYourself
          );
          await roommatePostingsApi.editLookingFor(
            userId,
            editRoommateForm.value.lookingFor
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
        if (
          editRoommateForm.value.guestsVisitors !== posting.guestsVisitors
        ) {
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
        photos: listing.photos ? [...listing.photos] : [], // Copy existing photos
      };
      // Reset photo upload state
      editSelectedPhotos.value = [];
      editUploading.value = false;
      editGeocodedLocation.value = null;
      editError.value = "";
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editError.value = "";
      editingListingId.value = null;
      // Reset photo upload state
      editSelectedPhotos.value = [];
      editUploading.value = false;
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

          await listingsApi.editAddress(listingId, editForm.value.address, latitude, longitude);
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

    // Photo editing functions
    const triggerEditPhotoSelect = () => {
      try {
        if (editPhotoInput.value) {
          editPhotoInput.value.click();
        }
      } catch (error) {
        console.error('Error in triggerEditPhotoSelect:', error);
      }
    };

    const handleEditPhotoSelect = (event) => {
      try {
        const files = Array.from(event.target.files);
        const maxPhotos = 5;
        const currentTotal = editForm.value.photos.length + editSelectedPhotos.value.length;

        if (currentTotal + files.length > maxPhotos) {
          alert(`You can only upload up to ${maxPhotos} photos total. Currently you have ${currentTotal} photos.`);
          return;
        }

        files.forEach(file => {
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
      } catch (error) {
        console.error('Error in handleEditPhotoSelect:', error);
      }
    };

    const removeEditSelectedPhoto = (index) => {
      try {
        editSelectedPhotos.value.splice(index, 1);
      } catch (error) {
        console.error('Error in removeEditSelectedPhoto:', error);
      }
    };

    const removeEditPhoto = async (index) => {
      try {
        const photo = editForm.value.photos[index];
        const listingId = editingListingId.value;

        if (!listingId) {
          editForm.value.photos.splice(index, 1);
          return;
        }

        // Extract photoId for deletion
        let photoId = photo._id || photo.id;
        if (!photoId && typeof photo === 'string') {
          photoId = photo.split('/').pop() || photo;
        } else if (!photoId && photo.url) {
          photoId = photo.url.split('/').pop() || photo.storageKey;
        }

        console.log('🗑️ Deleting photo:', { photoId, photo, listingId });

        await listingsApi.deletePhoto(listingId, photoId);
        editForm.value.photos.splice(index, 1);
        console.log('✅ Photo deleted successfully');
      } catch (error) {
        console.error('❌ Delete photo error:', error);
        alert('Failed to delete photo. Please try again.');
      }
    };

    const uploadEditPhotos = async () => {
      if (!editSelectedPhotos.value || editSelectedPhotos.value.length === 0) return;

      editUploading.value = true;

      try {
        // Mark all photos as uploading
        editSelectedPhotos.value.forEach(photo => {
          photo.uploading = true;
          photo.error = null;
        });

        // Upload images to Cloudinary
        const files = editSelectedPhotos.value.map(photo => photo.file);
        console.log('Starting upload of', files.length, 'files for edit');

        const uploadedUrls = await uploadMultipleImages(files);
        console.log('Upload completed for edit, received URLs:', uploadedUrls);

        // Add photos via API if we have a listing ID
        if (editingListingId.value) {
          for (const url of uploadedUrls) {
            try {
              const result = await listingsApi.addPhoto(editingListingId.value, url);
              console.log('Photo added via API:', result);

              // Add the new photo to our local form state
              const newPhoto = {
                url: url,
                thumbUrl: url,
                storageKey: url.split('/').pop() || 'unknown',
                alt: "Housing listing photo",
                width: 1200,
                height: 800,
                contentType: url.includes('.png') ? "image/png" : "image/jpeg",
                bytes: 500000,
                _id: result?.photo?._id || result?._id || url.split('/').pop()
              };
              editForm.value.photos.push(newPhoto);
            } catch (error) {
              console.error('Error adding photo via API:', error);
              // Still add to local state as fallback
              const newPhoto = {
                url: url,
                thumbUrl: url,
                storageKey: url.split('/').pop() || 'unknown',
                alt: "Housing listing photo",
                width: 1200,
                height: 800,
                contentType: url.includes('.png') ? "image/png" : "image/jpeg",
                bytes: 500000
              };
              editForm.value.photos.push(newPhoto);
            }
          }
        }

        // Clear selected photos
        editSelectedPhotos.value = [];
        console.log('Photos added to edit form, total photos now:', editForm.value.photos.length);

      } catch (error) {
        console.error('Photo upload error in edit:', error);
        editSelectedPhotos.value.forEach(photo => {
          photo.uploading = false;
          photo.error = error.message || 'Upload failed';
        });
        alert(`Failed to upload photos: ${error.message || 'Unknown error'}. Please try again.`);
      } finally {
        editUploading.value = false;
      }
    };

    return {
      roommatePostings,
      housingListings,
      isLoading,
      error,
      formatDate,
      getPhotoUrl,
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
      // Photo editing variables
      editPhotoInput,
      editSelectedPhotos,
      editUploading,
      // Photo editing functions
      triggerEditPhotoSelect,
      handleEditPhotoSelect,
      removeEditSelectedPhoto,
      removeEditPhoto,
      uploadEditPhotos,
      editAutocompleteSuggestions,
      showEditSuggestions,
      handleEditAddressInput,
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
  margin-bottom: 1.5rem;
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

.age-gender {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.tags-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.roommate-count {
  font-size: 0.85rem;
  color: #1e5a2e;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  background: #e8f5e9;
  border-radius: 4px;
}

.housing-status-badge {
  font-size: 0.85rem;
  color: #1e5a2e;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  background: #e8f5e9;
  border-radius: 4px;
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

.icon-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.edit-icon-btn {
  color: rgb(47, 71, 62);
}

.edit-icon-btn:hover {
  background: rgba(47, 71, 62, 0.1);
  transform: scale(1.1);
}

.delete-icon-btn {
  color: #dc3545;
}

.delete-icon-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  transform: scale(1.1);
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
  padding: 0 1.25rem 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.description-preview {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
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

/* Detail Modal Styles */
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

.info-table tr:nth-child(even) {
  background: #f8f9fa;
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
  padding-left: 0.5rem;
}

.info-table td:last-child {
  color: #333;
  padding-left: 1rem;
  padding-right: 0.5rem;
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
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: #fafafa;
  border-radius: 0 0 16px 16px;
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

/* Photo display styles */
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

/* Photo editing styles */
.photo-upload-section {
  margin-top: 1rem;
  padding: 1rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.current-photos {
  margin-bottom: 1rem;
}

.photos-grid-edit {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.photo-item-edit {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.photo-preview {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.remove-photo-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-photo-btn:hover:not(:disabled) {
  background: rgba(255, 0, 0, 1);
}

.remove-photo-btn:disabled {
  background: rgba(128, 128, 128, 0.5);
  cursor: not-allowed;
}

.selected-photos-preview {
  margin: 1rem 0;
}

.selected-photos-preview h4 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.selected-photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.selected-photo-item {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.selected-photo-preview {
  width: 100%;
  height: 80px;
  object-fit: cover;
  display: block;
}

.photo-status {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  text-align: center;
}

.photo-status .uploading {
  color: #ffeb3b;
}

.photo-status .error {
  color: #f44336;
}

.photo-status .ready {
  color: #4caf50;
}

.remove-selected-photo-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-selected-photo-btn:hover:not(:disabled) {
  background: rgba(255, 0, 0, 1);
}

.remove-selected-photo-btn:disabled {
  background: rgba(128, 128, 128, 0.5);
  cursor: not-allowed;
}

.photo-upload-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.photo-upload-btn,
.upload-photos-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-upload-btn {
  background: #2196f3;
  color: white;
}

.photo-upload-btn:hover:not(:disabled) {
  background: #1976d2;
}

.upload-photos-btn {
  background: #4caf50;
  color: white;
}

.upload-photos-btn:hover:not(:disabled) {
  background: #45a049;
}

.photo-upload-btn:disabled,
.upload-photos-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.photo-hint {
  margin: 0;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

/* Detail view photos styles */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.modal-photo-item {
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  transition: transform 0.2s ease;
}

.modal-photo-item:hover {
  transform: scale(1.02);
}

.modal-photo {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.modal-photo:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .modal-photo {
    height: 120px;
  }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
  width: 100%;
}

.modal-header h2 {
  color: rgb(47, 71, 62);
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-header .close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease;
  line-height: 1;
}

.modal-header .close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.625rem;
  color: rgb(47, 71, 62);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 85%;
  max-width: 500px;
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
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

.form-group textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.amenities-list {
  margin-bottom: 1rem;
}

.amenities-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid rgb(47, 71, 62);
}

.amenity-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.amenity-title {
  flex: 2;
}

.amenity-distance {
  flex: 1;
}

.remove-amenity-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.remove-amenity-btn:hover {
  background: #c82333;
}

.add-amenity-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 14px;
}

.add-amenity-btn:hover {
  background: #218838;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f0f0f0;
}

.cancel-btn,
.submit-btn {
  flex: 1;
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
  transform: none;
}

/* Autocomplete Styles */
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
  border: 2px solid rgb(47, 71, 62);
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.suggestion-item {
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
  color: #333;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: rgba(47, 71, 62, 0.1);
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 1rem;
    max-height: 90vh;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>
