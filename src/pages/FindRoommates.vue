<template>
  <main class="homepage">
    <section class="hero">
      <h2>Roommates</h2>
      <p>Browse roommate postings</p>
      <div class="button-spacer"></div>
    </section>

    <!-- Filter Bar -->
    <section class="filter-bar">
      <div class="filter-container">
        <div class="filter-group age-range-group">
          <label>Age Range</label>
          <div class="age-range-inputs">
          <input
            type="number"
            v-model.number="filters.minAge"
              placeholder="Min"
            min="18"
            max="120"
          />
            <span class="age-separator">-</span>
          <input
            type="number"
            v-model.number="filters.maxAge"
              placeholder="Max"
            min="18"
            max="120"
          />
          </div>
        </div>

        <div class="filter-group">
          <label for="filterGender">Gender</label>
          <select id="filterGender" v-model="filters.gender">
            <option value="">Any</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="filter-group location-filter-group">
          <label for="filterLocation">Location</label>
          <div class="autocomplete-wrapper">
          <input
            type="text"
              id="filterLocation"
              v-model="filters.location"
              @input="handleFilterLocationInput"
              @focus="showFilterSuggestions = filterAutocompleteSuggestions.length > 0"
              @blur="handleFilterLocationBlur"
              placeholder="e.g., San Francisco"
              autocomplete="off"
            />
            <ul v-if="showFilterSuggestions && filterAutocompleteSuggestions.length" class="suggestions-list filter-suggestions-list">
              <li
                v-for="(suggestion, index) in filterAutocompleteSuggestions"
                :key="index"
                @click="selectFilterSuggestion(suggestion)"
                class="suggestion-item"
              >
                {{ getSuggestionText(suggestion) }}
              </li>
            </ul>
          </div>
        </div>

        <div class="filter-actions">
          <button @click="applyFilters" class="search-btn">Search</button>
          <button @click="clearFilters" class="clear-btn">Clear</button>
        </div>
      </div>
    </section>

    <section class="listings-section">
      <div v-if="isLoading" class="loading">Loading roommate postings...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="filteredPostings.length === 0" class="no-listings">
        No roommate postings match your filters. Try adjusting your search criteria.
      </div>
      <div v-else class="listings-container">
        <!-- Compact Card View -->
        <div class="listings-grid">
          <div
            v-for="posting in filteredPostings"
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
                  v-if="!isPoster(posting)"
                  @click="toggleSavedItem(posting._id)"
                  class="favorite-btn"
                  :class="{ 'is-saved': isSaved(posting._id) }"
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
              <div class="expand-hint">
                <span>Click for details</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded Detail Modal/Panel -->
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
                    <tr v-if="getExpandedPosting().gender || getExpandedPosting().age">
                      <td>Gender & Age</td>
                      <td>
                        <span v-if="getExpandedPosting().gender">{{ getExpandedPosting().gender }}</span>
                        <span v-if="getExpandedPosting().gender && getExpandedPosting().age">, </span>
                        <span v-if="getExpandedPosting().age">{{ getExpandedPosting().age }} years old</span>
                      </td>
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

              <!-- About Me (new format) -->
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
              <div v-if="!isPoster(getExpandedPosting())" class="action-buttons-grid">
              <button
                  v-if="!isSaved(getExpandedPosting()._id)"
                  @click.stop="toggleSavedItem(getExpandedPosting()._id)"
                  class="favorite-action-btn"
                >
                  <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>Favorite</span>
                </button>

                <div v-if="isSaved(getExpandedPosting()._id)" class="favorited-message">
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

              <div v-if="isPoster(getExpandedPosting())" class="owner-actions">
                <button @click="editPosting(getExpandedPosting())" class="edit-btn">Edit Posting</button>
                <button @click="deletePosting(getExpandedPosting()._id)" class="delete-btn">Delete Posting</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Create Posting Modal -->
    <div v-if="modalVisible" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
        <h2>Create Roommate Posting</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="emitCreatePosting">
          <div class="form-group">
            <label for="city">City *</label>
            <input
              type="text"
              id="city"
              v-model="form.city"
              required
              placeholder="e.g., San Francisco"
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

          <div class="form-group">
            <label for="numberOfRoommates">Number of Roommates Looking For *</label>
            <input
              type="number"
              id="numberOfRoommates"
              v-model.number="form.numberOfRoommates"
              required
              min="1"
              max="10"
              placeholder="e.g., 2"
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
              <input type="date" id="endDate" v-model="form.endDate" required />
            </div>
          </div>

          <div class="form-group">
            <label for="dailyRhythm">Daily Rhythm *</label>
            <select id="dailyRhythm" v-model="form.dailyRhythm" required>
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
            <label for="cleanlinessPreference">Cleanliness Preference *</label>
            <select
              id="cleanlinessPreference"
              v-model="form.cleanlinessPreference"
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
            <label for="homeEnvironment">Home Environment *</label>
            <select
              id="homeEnvironment"
              v-model="form.homeEnvironment"
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
            <label for="guestsVisitors">Guests & Visitors *</label>
            <select
              id="guestsVisitors"
              v-model="form.guestsVisitors"
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
            <label for="housingStatus">Housing Status *</label>
            <select
              id="housingStatus"
              v-model="form.housingStatus"
              required
            >
              <option value="" disabled>Select your housing status</option>
              <option value="Looking for housing">Looking for housing</option>
              <option value="Found housing">Found housing</option>
            </select>
          </div>

          <div class="form-group">
            <label for="aboutMe">Tell More About Yourself *</label>
            <textarea
              id="aboutMe"
              v-model="form.aboutMe"
              required
              rows="4"
              placeholder="Tell us about yourself, your interests, lifestyle, etc."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="lookingFor">What You Are Looking For in a Roommate *</label>
            <textarea
              id="lookingFor"
              v-model="form.lookingFor"
              required
              rows="4"
              placeholder="Describe what you're looking for in a roommate"
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

    <!-- Edit Posting Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
        <h2>Edit Roommate Posting</h2>
          <button @click="closeEditModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="handleEditPosting">
          <div class="form-group">
            <label for="edit-city">City *</label>
            <input
              type="text"
              id="edit-city"
              v-model="editForm.city"
              required
              placeholder="e.g., San Francisco"
            />
          </div>

          <div class="form-group">
            <label for="edit-gender">Gender *</label>
            <select id="edit-gender" v-model="editForm.gender" required>
              <option value="" disabled>Select your gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-age">Age *</label>
            <input
              type="number"
              id="edit-age"
              v-model.number="editForm.age"
              required
              min="18"
              max="120"
              placeholder="e.g., 25"
            />
          </div>

          <div class="form-group">
            <label for="edit-numberOfRoommates">Number of Roommates Looking For *</label>
            <input
              type="number"
              id="edit-numberOfRoommates"
              v-model.number="editForm.numberOfRoommates"
              required
              min="1"
              max="10"
              placeholder="e.g., 2"
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
            <label for="edit-dailyRhythm">Daily Rhythm *</label>
            <select
              id="edit-dailyRhythm"
              v-model="editForm.dailyRhythm"
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
            <label for="edit-cleanlinessPreference"
              >Cleanliness Preference *</label
            >
            <select
              id="edit-cleanlinessPreference"
              v-model="editForm.cleanlinessPreference"
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
            <label for="edit-homeEnvironment">Home Environment *</label>
            <select
              id="edit-homeEnvironment"
              v-model="editForm.homeEnvironment"
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
            <label for="edit-guestsVisitors">Guests & Visitors *</label>
            <select
              id="edit-guestsVisitors"
              v-model="editForm.guestsVisitors"
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
            <label for="edit-housingStatus">Housing Status *</label>
            <select
              id="edit-housingStatus"
              v-model="editForm.housingStatus"
              required
            >
              <option value="" disabled>Select your housing status</option>
              <option value="Looking for housing">Looking for housing</option>
              <option value="Found housing">Found housing</option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-aboutMe">Tell More About Yourself *</label>
            <textarea
              id="edit-aboutMe"
              v-model="editForm.aboutMe"
              required
              rows="4"
              placeholder="Tell us about yourself, your interests, lifestyle, etc."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="edit-lookingFor">What You Are Looking For in a Roommate *</label>
            <textarea
              id="edit-lookingFor"
              v-model="editForm.lookingFor"
              required
              rows="4"
              placeholder="Describe what you're looking for in a roommate"
            ></textarea>
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

    <!-- Floating Create Button -->
    <button @click="openModal" class="floating-create-btn" title="Create New Posting">
      +
    </button>

    <!-- Contact Success Message Modal -->
    <div v-if="showContactMessage" class="modal-overlay" @click="closeContactMessage">
      <div class="modal-content message-modal" @click.stop>
        <div class="message-header">
          <h2>Message Sent!</h2>
          <button @click="closeContactMessage" class="close-btn">×</button>
        </div>
        <div class="message-body">
          <p>We emailed the poster of this post about your interest and contact information. They will be in contact soon.</p>
        </div>
        <div class="message-actions">
          <button @click="closeContactMessage" class="submit-btn">OK</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useSessionStore } from "../stores/session.js";
import {
  roommatePostings,
  savedItems,
  userInfo as userInfoApi,
  apiRequest,
} from "../utils/api.js";

export default {
  name: "FindRoommates",
  setup() {
    const form = ref({
      city: "",
      gender: "",
      age: "",
      aboutMe: "",
      lookingFor: "",
      housingStatus: "",
      startDate: "",
      endDate: "",
      dailyRhythm: "",
      cleanlinessPreference: "",
      homeEnvironment: "",
      guestsVisitors: "",
      numberOfRoommates: "",
    });
    const sessionStore = useSessionStore();
    const postings = ref([]);
    const savedItemIds = ref(new Set());
    const savedItemsMap = ref(new Map()); // Map of itemId -> {tags: []}
    const isLoading = ref(false);
    const error = ref("");
    const localModal = ref(false);
    const isCreating = ref(false);
    const createError = ref("");
    const isContacting = ref({}); // Track loading state per posting ID
    const showContactMessage = ref(false);
    const showEditModal = ref(false);
    const isEditing = ref(false);
    const editError = ref("");
    const editingPostingId = ref(null);
    const editForm = ref({
      city: "",
      gender: "",
      age: "",
      aboutMe: "",
      lookingFor: "",
      startDate: "",
      endDate: "",
      dailyRhythm: "",
      cleanlinessPreference: "",
      homeEnvironment: "",
      guestsVisitors: "",
      numberOfRoommates: "",
    });

    // New data for expanded view
    const expandedPosting = ref(null);

    // Filter state
    const filters = ref({
      minAge: null,
      maxAge: null,
      gender: "",
      location: "",
    });

    const appliedFilters = ref({
      minAge: null,
      maxAge: null,
      gender: "",
      location: "",
    });

    // Filter location autocomplete state
    const filterAutocompleteSuggestions = ref([]);
    const showFilterSuggestions = ref(false);
    let filterSessionToken = null;

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

    // Computed property for filtered and sorted postings
    const filteredPostings = computed(() => {
      let result = [...postings.value];

      // Apply age filters
      if (
        appliedFilters.value.minAge !== null &&
        appliedFilters.value.minAge !== ""
      ) {
        result = result.filter(
          (posting) => posting.age >= appliedFilters.value.minAge
        );
      }

      if (
        appliedFilters.value.maxAge !== null &&
        appliedFilters.value.maxAge !== ""
      ) {
        result = result.filter(
          (posting) => posting.age <= appliedFilters.value.maxAge
        );
      }

      // Apply gender filter
      if (appliedFilters.value.gender) {
        result = result.filter(
          (posting) => posting.gender === appliedFilters.value.gender
        );
      }

      // Apply location filter (case-insensitive partial match) - searches both city and location fields
      if (appliedFilters.value.location) {
        const locationFilter = appliedFilters.value.location.toLowerCase();
        result = result.filter((posting) =>
          (posting.city || "").toLowerCase().includes(locationFilter) ||
          (posting.location || "").toLowerCase().includes(locationFilter)
        );
      }

      // Sort by most recent first (by _id descending, as MongoDB ObjectIds contain timestamp)
      return result.sort((a, b) => {
        return b._id.localeCompare(a._id);
      });
    });

    const applyFilters = () => {
      appliedFilters.value = {
        minAge: filters.value.minAge,
        maxAge: filters.value.maxAge,
        gender: filters.value.gender,
        location: filters.value.location,
      };
    };

    const clearFilters = () => {
      filters.value = {
        minAge: null,
        maxAge: null,
        gender: "",
        location: "",
      };
      appliedFilters.value = {
        minAge: null,
        maxAge: null,
        gender: "",
        location: "",
      };
    };

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
          console.error('Google Maps API key not available for autocomplete');
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
     * Handle filter location input changes
     */
    const handleFilterLocationInput = (event) => {
      const input = event.target.value;
      filters.value.location = input;
      fetchFilterLocationSuggestions(input);
    };

    /**
     * Handle blur event for filter location autocomplete
     */
    const handleFilterLocationBlur = () => {
      setTimeout(() => {
        showFilterSuggestions.value = false;
      }, 200);
    };

    /**
     * Fetch autocomplete suggestions for filter location
     */
    const fetchFilterLocationSuggestions = async (input) => {
      if (!input || input.length < 2) {
        filterAutocompleteSuggestions.value = [];
        showFilterSuggestions.value = false;
        return;
      }

      try {
        const isLoaded = await ensureGoogleMapsLoaded();
        if (!isLoaded || !google.maps.places.AutocompleteSuggestion) {
          return;
        }

        if (!filterSessionToken) {
          filterSessionToken = new google.maps.places.AutocompleteSessionToken();
        }

        const request = {
          input: input,
          sessionToken: filterSessionToken,
          locationBias: {
            west: -71.15,
            north: 42.40,
            east: -71.05,
            south: 42.35,
          },
        };

        const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        filterAutocompleteSuggestions.value = suggestions.map(s => {
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
        showFilterSuggestions.value = suggestions && suggestions.length > 0;
      } catch (err) {
        console.error('Error fetching filter location suggestions:', err);
        filterAutocompleteSuggestions.value = [];
        showFilterSuggestions.value = false;
      }
    };

    /**
     * Select a filter location suggestion
     */
    const selectFilterSuggestion = async (suggestion) => {
      try {
        if (!suggestion) return;

        const prediction = suggestion.placePrediction || suggestion.rawSuggestion || suggestion;
        let place;

        if (typeof prediction.toPlace === 'function') {
          place = prediction.toPlace();
        } else {
          return;
        }

        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });

        const address = place.formattedAddress || place.displayName;
        filters.value.location = address;
        showFilterSuggestions.value = false;
        filterAutocompleteSuggestions.value = [];
        filterSessionToken = null;
      } catch (err) {
        console.error('Error selecting filter location:', err);
      }
    };

    /**
     * Get suggestion display text safely
     */
    const getSuggestionText = (suggestion) => {
      if (!suggestion) {
        return '';
      }

      if (suggestion.displayText) {
        return suggestion.displayText;
      }

      return 'Unknown location';
    };

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

    // Convert gender number to string for form
    // Form uses: "Male", "Female", "Non-binary", "Prefer not to say"
    // Profile uses: 0=Male, 1=Female, 2=Non-binary, 3=Other
    const getGenderString = (genderNum) => {
      const genderMap = {
        0: "Male",
        1: "Female",
        2: "Non-binary",
        3: "Prefer not to say" // Map "Other" (3) to "Prefer not to say" for form
      };
      return genderMap[genderNum] || "";
    };


    const openModal = async () => {
      // Ensure we have user info before opening modal
      await ensureValidUserId();

      // Auto-populate age and gender from user profile
      if (sessionStore.user) {
        // Set age if available
        if (sessionStore.user.age !== undefined && sessionStore.user.age !== null) {
          form.value.age = sessionStore.user.age;
        }

        // Set gender if available (convert from number to string)
        if (sessionStore.user.gender !== undefined && sessionStore.user.gender !== null) {
          form.value.gender = getGenderString(sessionStore.user.gender);
        }
      }

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

    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // New methods for expanded view
    const togglePostingDetails = (postingId) => {
      if (expandedPosting.value === postingId) {
        expandedPosting.value = null;
      } else {
        expandedPosting.value = postingId;
      }
    };

    const closeDetails = () => {
      expandedPosting.value = null;
    };

    const getExpandedPosting = () => {
      return postings.value.find(p => p._id === expandedPosting.value) || {};
    };

    // Helper functions to extract aboutMe and lookingFor for display
    const getAboutMe = (posting) => {
      if (!posting) return "";
      return posting.aboutYourself || "";
    };

    const getLookingFor = (posting) => {
      if (!posting) return "";
      return posting.lookingFor || "";
    };

    const truncateText = (text, maxLength) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    const closeModal = () => {
      localModal.value = false;
      createError.value = "";
      // Reset form but keep age and gender empty - they'll be auto-populated on next open
      form.value = {
        city: "",
        gender: "",
        age: "",
        aboutMe: "",
        lookingFor: "",
        housingStatus: "",
        startDate: "",
        endDate: "",
        dailyRhythm: "",
        cleanlinessPreference: "",
        homeEnvironment: "",
        guestsVisitors: "",
        numberOfRoommates: "",
      };
    };

    // Helper function to parse old combined homeEnvironment format
    const parseHomeEnvironment = (homeEnv, guestsVis) => {
      // If guestsVisitors already has a value, use the new format
      if (guestsVis && guestsVis.trim() !== "") {
        return {
          homeEnvironment: homeEnv ?? "",
          guestsVisitors: guestsVis ?? "",
        };
      }

      // If homeEnvironment matches new format values, use as-is
      const newFormatValues = [
        "Quiet (minimal noise, low visitors)",
        "Moderate (some noise, occasional visitors)",
        "Social / lively (friends over often)",
        "Flexible / depends on schedule",
      ];
      if (homeEnv && newFormatValues.includes(homeEnv)) {
        return {
          homeEnvironment: homeEnv,
          guestsVisitors: guestsVis ?? "",
        };
      }

      // Parse old combined format
      if (homeEnv) {
        const homeEnvLower = homeEnv.toLowerCase();
        let parsedHomeEnv = "";
        let parsedGuestsVis = "";

        // Map old combined values to new separate fields
        if (homeEnvLower.includes("quiet home")) {
          parsedHomeEnv = "Quiet (minimal noise, low visitors)";
          if (homeEnvLower.includes("prefer few or no guests")) {
            parsedGuestsVis = "Prefer few or no guests";
          } else if (homeEnvLower.includes("occasional guests")) {
            parsedGuestsVis = "Occasional guests okay";
          }
        } else if (homeEnvLower.includes("moderate activity")) {
          parsedHomeEnv = "Moderate (some noise, occasional visitors)";
          if (homeEnvLower.includes("occasional guests")) {
            parsedGuestsVis = "Occasional guests okay";
          } else if (homeEnvLower.includes("frequent guests")) {
            parsedGuestsVis = "Comfortable with frequent guests";
          }
        } else if (homeEnvLower.includes("social") || homeEnvLower.includes("lively")) {
          parsedHomeEnv = "Social / lively (friends over often)";
          if (homeEnvLower.includes("frequent guests")) {
            parsedGuestsVis = "Comfortable with frequent guests";
          } else if (homeEnvLower.includes("overnight guests")) {
            parsedGuestsVis = "Comfortable with overnight guests";
          }
        } else if (homeEnvLower.includes("flexible")) {
          parsedHomeEnv = "Flexible / depends on schedule";
          parsedGuestsVis = "Occasional guests okay"; // Default for flexible
        }

        // If we successfully parsed, return parsed values
        if (parsedHomeEnv) {
          return {
            homeEnvironment: parsedHomeEnv,
            guestsVisitors: parsedGuestsVis || "Occasional guests okay",
          };
        }
      }

      // Fallback: use stored values as-is
      return {
        homeEnvironment: homeEnv ?? "",
        guestsVisitors: guestsVis ?? "",
      };
    };

    const editPosting = (posting) => {
      editingPostingId.value = posting._id;
      // Handle both old (description) and new (aboutYourself/lookingFor) formats
      const aboutMe = posting.aboutYourself || (posting.description ? posting.description.split('\n\n---\n\n')[0] : "");
      const lookingFor = posting.lookingFor || (posting.description && posting.description.includes('---') ? posting.description.split('\n\n---\n\n')[1] : "");

      // Use stored values directly - parseHomeEnvironment is only for display/creation, not editing
      // Preserve exact values, trimming whitespace to ensure they match dropdown options
      const homeEnv = posting.homeEnvironment ? String(posting.homeEnvironment).trim() : "";
      const guestsVis = posting.guestsVisitors ? String(posting.guestsVisitors).trim() : "";

      editForm.value = {
        city: posting.city ?? "",
        gender: posting.gender ?? "",
        age: posting.age ?? "",
        aboutMe: aboutMe,
        lookingFor: lookingFor,
        housingStatus: posting.housingStatus ?? "",
        startDate: formatDateForInput(posting.startDate),
        endDate: formatDateForInput(posting.endDate),
        dailyRhythm: posting.dailyRhythm ? String(posting.dailyRhythm).trim() : "",
        cleanlinessPreference: posting.cleanlinessPreference ? String(posting.cleanlinessPreference).trim() : "",
        homeEnvironment: homeEnv,
        guestsVisitors: guestsVis,
        numberOfRoommates: posting.numberOfRoommates ?? "",
      };
      editError.value = "";
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editError.value = "";
      editingPostingId.value = null;
      editForm.value = {
        city: "",
        gender: "",
        age: "",
        aboutMe: "",
        lookingFor: "",
        housingStatus: "",
        startDate: "",
        endDate: "",
        dailyRhythm: "",
        cleanlinessPreference: "",
        homeEnvironment: "",
        guestsVisitors: "",
        numberOfRoommates: "",
      };
    };

    const handleEditPosting = async () => {
      if (!editingPostingId.value) {
        editError.value = "No posting selected for editing.";
        return;
      }

      isEditing.value = true;
      editError.value = "";

      try {
        const postingId = editingPostingId.value;
        const posting = postings.value.find((p) => p._id === postingId);
        if (!posting) {
          editError.value = "Posting not found";
          return;
        }

        const userId = sessionStore.user?.id || sessionStore.user?.user;
        if (!userId) {
          editError.value = "User not found";
          return;
        }

        // Compare and update only changed fields
        if (editForm.value.city !== posting.city) {
          await roommatePostings.editCity(userId, editForm.value.city);
        }
        if (editForm.value.gender !== posting.gender) {
          await roommatePostings.editGender(userId, editForm.value.gender);
        }
        if (editForm.value.age !== posting.age) {
          await roommatePostings.editAge(userId, editForm.value.age);
        }
        // Edit aboutYourself if changed (only if posting has new format)
        if (posting.aboutYourself !== undefined && editForm.value.aboutMe !== posting.aboutYourself) {
          await roommatePostings.editAboutYourself(
            userId,
            editForm.value.aboutMe
          );
        }
        // Edit lookingFor if changed (only if posting has new format)
        if (posting.lookingFor !== undefined && editForm.value.lookingFor !== posting.lookingFor) {
          await roommatePostings.editLookingFor(
            userId,
            editForm.value.lookingFor
          );
        }
        // Edit guestsVisitors if changed
        if (editForm.value.guestsVisitors !== posting.guestsVisitors) {
          await roommatePostings.editGuestsVisitors(
            userId,
            editForm.value.guestsVisitors
          );
        }
        // If old format (description), update both fields to migrate to new format
        if (posting.description && !posting.aboutYourself && !posting.lookingFor) {
          await roommatePostings.editAboutYourself(
            userId,
            editForm.value.aboutMe
          );
          await roommatePostings.editLookingFor(
            userId,
            editForm.value.lookingFor
          );
        }

        // Update dates if changed
        if (posting.startDate) {
          const newStartDate = new Date(editForm.value.startDate);
          const oldStartDate = new Date(posting.startDate);
          if (newStartDate.getTime() !== oldStartDate.getTime()) {
            await roommatePostings.editStartDate(
              userId,
              editForm.value.startDate
            );
          }
        } else if (editForm.value.startDate) {
          // Date didn't exist before, add it now
          await roommatePostings.editStartDate(
            userId,
            editForm.value.startDate
          );
        }

        if (posting.endDate) {
          const newEndDate = new Date(editForm.value.endDate);
          const oldEndDate = new Date(posting.endDate);
          if (newEndDate.getTime() !== oldEndDate.getTime()) {
            await roommatePostings.editEndDate(userId, editForm.value.endDate);
          }
        } else if (editForm.value.endDate) {
          // Date didn't exist before, add it now
          await roommatePostings.editEndDate(userId, editForm.value.endDate);
        }

        // Update new fields if changed
        if (editForm.value.dailyRhythm !== posting.dailyRhythm) {
          await roommatePostings.editDailyRhythm(
            userId,
            editForm.value.dailyRhythm
          );
        }
        if (
          editForm.value.cleanlinessPreference !== posting.cleanlinessPreference
        ) {
          await roommatePostings.editCleanlinessPreference(
            userId,
            editForm.value.cleanlinessPreference
          );
        }
        if (editForm.value.homeEnvironment !== posting.homeEnvironment) {
          await roommatePostings.editHomeEnvironment(
            userId,
            editForm.value.homeEnvironment
          );
        }
        if (editForm.value.numberOfRoommates !== posting.numberOfRoommates) {
          await roommatePostings.editNumberOfRoommates(
            userId,
            editForm.value.numberOfRoommates
          );
        }
        if (editForm.value.housingStatus !== posting.housingStatus) {
          await roommatePostings.editHousingStatus(
            userId,
            editForm.value.housingStatus
          );
        }

        // Refresh postings to get updated data
        await fetchPostings();
        closeEditModal();
      } catch (err) {
        console.error("[FindRoommates] Error editing posting:", err);
        editError.value = err.message || "Failed to update posting";
      } finally {
        isEditing.value = false;
      }
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
        // Close the expanded view if this posting was expanded
        if (expandedPosting.value === postingId) {
          expandedPosting.value = null;
        }
        await fetchPostings();
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
        
        // Show success message popup
        showContactMessage.value = true;

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

    const closeContactMessage = () => {
      showContactMessage.value = false;
    };

    const emitCreatePosting = async () => {
      isCreating.value = true;
      createError.value = "";

      try {
        console.log("Creating roommate posting with data:", form.value);

        // Validate required fields
        if (
          !form.value.city ||
          !form.value.gender ||
          !form.value.age ||
          !form.value.aboutMe ||
          !form.value.lookingFor ||
          !form.value.housingStatus ||
          !form.value.startDate ||
          !form.value.endDate ||
          !form.value.dailyRhythm ||
          !form.value.cleanlinessPreference ||
          !form.value.homeEnvironment ||
          !form.value.numberOfRoommates
        ) {
          createError.value = "Please fill in all required fields";
          isCreating.value = false;
          return;
        }

        const postingData = {
          city: form.value.city,
          gender: form.value.gender,
          age: form.value.age,
          aboutYourself: form.value.aboutMe,
          lookingFor: form.value.lookingFor,
          housingStatus: form.value.housingStatus,
          startDate: form.value.startDate,
          endDate: form.value.endDate,
          dailyRhythm: form.value.dailyRhythm,
          cleanlinessPreference: form.value.cleanlinessPreference,
          homeEnvironment: form.value.homeEnvironment,
          guestsVisitors: form.value.guestsVisitors,
          numberOfRoommates: form.value.numberOfRoommates,
        };

        console.log("Sending posting data:", postingData);
        const result = await roommatePostings.create(postingData);
        console.log("Posting create response:", result);

        // Check for errors in the result
        if (result && result.error) {
          console.error("Backend returned error:", result.error);
          createError.value = result.error;
          isCreating.value = false;
          return;
        }

        // Check if posting was created successfully
        if (!result || (!result.posting && !result._id)) {
          console.error("Unexpected response format:", result);
          createError.value =
            "Failed to create posting: Unexpected response from server";
          isCreating.value = false;
          return;
        }

        console.log("Posting created successfully:", result);

        // Clear form and close modal
        form.value = {
          city: "",
          gender: "",
          age: "",
          aboutMe: "",
          lookingFor: "",
          startDate: "",
          endDate: "",
          dailyRhythm: "",
          cleanlinessPreference: "",
          homeEnvironment: "",
          numberOfRoommates: "",
        };
        closeModal();

        // Refresh postings
        await fetchPostings();
      } catch (err) {
        console.error("Error creating posting:", err);
        createError.value =
          err.message || "Failed to create posting. Please try again.";
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

      // Check if we should auto-open the create modal
      if (route.query.openCreate === 'true') {
        await openModal();
      }
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
      filteredPostings,
      filters,
      applyFilters,
      clearFilters,
      filterAutocompleteSuggestions,
      showFilterSuggestions,
      handleFilterLocationInput,
      handleFilterLocationBlur,
      selectFilterSuggestion,
      getSuggestionText,
      isLoading,
      error,
      isCreating,
      createError,
      emitCreatePosting,
      openModal,
      closeModal,
      modalVisible,
      isSaved,
      getItemTags,
      toggleSavedItem,
      contactPoster,
      isContacting,
      showContactMessage,
      closeContactMessage,
      isPoster,
      deletePosting,
      formatDate,
      editPosting,
      showEditModal,
      isEditing,
      editError,
      editForm,
      closeEditModal,
      handleEditPosting,
      // New expanded view functionality
      expandedPosting,
      togglePostingDetails,
      closeDetails,
      getExpandedPosting,
      truncateText,
      getAboutMe,
      getLookingFor,
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

.floating-create-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: rgb(30, 90, 46);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  font-weight: 300;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.3s, background 0.2s;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.floating-create-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  background: rgb(22, 70, 36);
}

.floating-create-btn:active {
  transform: scale(1.05);
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

.location-filter-group {
  flex: 1.5;
  min-width: 200px;
}

.filter-group label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.filter-group input,
.filter-group select {
  padding: 0.625rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, background 0.2s;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: white;
}

.age-range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  transition: border-color 0.2s, background 0.2s;
}

.age-range-inputs:focus-within {
  border-color: rgba(255, 255, 255, 0.5);
  background: white;
}

.age-range-inputs input {
  border: none;
  padding: 0.375rem;
  flex: 1;
  min-width: 0;
  background: transparent;
}

.age-range-inputs input:focus {
  border: none;
  background: transparent;
}

.age-separator {
  color: #666;
  font-weight: 500;
  user-select: none;
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

.age-gender {
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

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.card-preview {
  padding: 0 1.25rem 1.25rem;
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

.owner-actions {
  display: flex;
  gap: 1rem;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.listing-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
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
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f0f0f0;
}

.listing-header h3 {
  color: rgb(47, 71, 62);
  font-size: 1.25rem;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  color: #ccc;
  -webkit-text-stroke: 1.5px #999;
  -webkit-text-fill-color: transparent;
  transition: all 0.2s;
  font-size: 2.2rem;
  font-weight: 300;
  letter-spacing: -0.1em;
  transform: scaleX(0.85);
}

.favorite-btn.is-saved .heart-icon {
  color: #e74c3c;
  -webkit-text-stroke: 1px #e74c3c;
  -webkit-text-fill-color: #e74c3c;
}

.owner-badge {
  background: rgb(47, 71, 62);
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.favorite-btn:hover {
  transform: scale(1.15);
}

.listing-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info,
.dates {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
}

.description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-top: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.action-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
}

.favorite-action-btn {
  background: rgb(22, 53, 27);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.favorite-action-btn:hover {
  background: rgb(15, 38, 19);
  transform: translateY(-2px);
}

.favorite-action-btn:active {
  transform: translateY(0);
}

.contact-btn {
  background: rgb(22, 53, 27);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.contact-btn:hover:not(:disabled) {
  background: rgb(15, 38, 19);
  transform: translateY(-2px);
}

.contact-btn:active:not(:disabled) {
  transform: translateY(0);
}

.contact-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  flex-shrink: 0;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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

/* Message Modal Styles */
.message-modal {
  max-width: 500px;
  padding: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: rgb(47, 71, 62);
  color: white;
  border-radius: 12px 12px 0 0;
}

.message-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
}

.message-header .close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.message-header .close-btn:hover {
  opacity: 0.8;
}

.message-body {
  padding: 2rem;
  text-align: center;
}

.message-body p {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
}

.message-actions {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  border-radius: 0 0 12px 12px;
}

.message-actions .submit-btn {
  min-width: 120px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
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

@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }

  .hero h2 {
    font-size: 2rem;
  }
}

/* Flat Icon Styles */
[class^="icon-"] {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  vertical-align: middle;
  position: relative;
}

/* User Icon - Simple circle with dot */
.icon-user::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1e5a2e;
  top: 2px;
  left: 4px;
}

.icon-user::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 8px;
  border-radius: 8px 8px 0 0;
  background: #1e5a2e;
  bottom: 0;
  left: 2px;
}

/* Users Icon - Two overlapping circles */
.icon-users {
  width: 20px;
}

.icon-users::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1e5a2e;
  top: 2px;
  left: 2px;
}

.icon-users::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1e5a2e;
  top: 2px;
  left: 8px;
}

/* Calendar Icon */
.icon-calendar::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 12px;
  border: 2px solid #1e5a2e;
  border-radius: 2px;
  top: 2px;
  left: 1px;
}

.icon-calendar::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 1px;
  background: #1e5a2e;
  top: 6px;
  left: 4px;
  box-shadow: 0 3px 0 #1e5a2e;
}

/* Clock Icon */
.icon-clock::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #1e5a2e;
  border-radius: 50%;
  top: 1px;
  left: 1px;
}

.icon-clock::after {
  content: '';
  position: absolute;
  width: 1px;
  height: 5px;
  background: #1e5a2e;
  top: 4px;
  left: 8px;
  transform-origin: bottom;
  transform: rotate(45deg);
}

/* Clean Icon - Sparkle */
.icon-clean::before {
  content: '';
  position: absolute;
  width: 2px;
  height: 12px;
  background: #1e5a2e;
  top: 2px;
  left: 7px;
  transform: rotate(45deg);
}

.icon-clean::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 2px;
  background: #1e5a2e;
  top: 7px;
  left: 2px;
  transform: rotate(45deg);
}

/* Home Icon */
.icon-home::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 8px;
  border-left: 2px solid #1e5a2e;
  border-right: 2px solid #1e5a2e;
  border-bottom: 2px solid #1e5a2e;
  bottom: 0;
  left: 2px;
}

.icon-home::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 6px solid #1e5a2e;
  top: 0;
  left: 0;
}

/* Visitors Icon - Door */
.icon-visitors::before {
  content: '';
  position: absolute;
  width: 10px;
  height: 14px;
  border: 2px solid #1e5a2e;
  border-radius: 2px;
  top: 1px;
  left: 3px;
}

.icon-visitors::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 2px;
  background: #1e5a2e;
  border-radius: 50%;
  top: 8px;
  left: 6px;
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

.filter-suggestions-list {
  z-index: 1001;
}
</style>
