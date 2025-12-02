<template>
  <main class="homepage">
    <section class="hero">
      <h2>Find Your Perfect Summer Housing</h2>
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
          <input
            type="date"
            id="filterStartDate"
            v-model="filters.startDate"
          />
        </div>

        <div class="filter-group">
          <label for="filterEndDate">Available Until</label>
          <input
            type="date"
            id="filterEndDate"
            v-model="filters.endDate"
          />
        </div>

        <div class="filter-actions">
          <button @click="applyFilters" class="search-btn">Search</button>
          <button @click="clearFilters" class="clear-btn">Clear</button>
        </div>
      </div>
    </section>

    <section class="listings-section">
      <div v-if="loading" class="loading">Loading listings...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="filteredListings.length === 0" class="no-listings">
        No listings match your filters. Try adjusting your search criteria.
      </div>
      <div v-else class="listings-grid">
        <div
          v-for="listing in filteredListings"
          :key="listing._id"
          class="listing-card"
        >
          <div class="listing-header">
            <h3>{{ listing.title }}</h3>
            <div class="header-actions">
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

          <div class="listing-details">
            <p class="address"><strong>📍</strong> {{ listing.address }}</p>
            <p class="dates">
              <strong>📅</strong> {{ formatDate(listing.startDate) }} -
              {{ formatDate(listing.endDate) }}
            </p>
            <p class="price"><strong>💵</strong> ${{ listing.price }}/month</p>

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

            <button
              v-if="!isOwner(listing)"
              @click="sendInterest(listing._id)"
              class="interest-btn"
              :disabled="isSendingInterest[listing._id]"
            >
              {{
                isSendingInterest[listing._id] ? "Sending..." : "Send Interest"
              }}
            </button>
          </div>

          <div v-if="isOwner(listing)" class="listing-actions">
            <button @click="editListing(listing)" class="edit-btn">Edit</button>
            <button @click="deleteListing(listing._id)" class="delete-btn">
              Delete
            </button>
          </div>
          <!-- Debug: Always show if isOwner check -->
          <div
            v-if="false"
            style="background: yellow; padding: 10px; margin-top: 10px"
          >
            <strong>DEBUG:</strong> isOwner(listing) = {{ isOwner(listing)
            }}<br />
            Listing Lister: {{ listing.lister }}<br />
            User ID: {{ sessionStore.user?.id }}<br />
            User Object: {{ JSON.stringify(sessionStore.user) }}
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
              <div
                v-for="(amenity, index) in newListing.amenities"
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

          <div v-if="createError" class="error-message">{{ createError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeCreateModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn" :disabled="creating">
              {{ creating ? "Creating..." : "Create Listing" }}
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
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import {
  listings,
  auth,
  savedItems,
  userInfo as userInfoApi,
} from "../utils/api.js";
import { useSessionStore } from "../stores/session.js";

export default {
  name: "FindHousing",
  setup() {
    const sessionStore = useSessionStore();
    const listingsData = ref([]);
    const savedItemIds = ref(new Set());
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
      amenities: [],
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

    // Computed property for filtered listings
    const filteredListings = computed(() => {
      let result = [...listingsData.value];

      // Apply price filters
      if (appliedFilters.value.minPrice !== null && appliedFilters.value.minPrice !== "") {
        result = result.filter(listing => listing.price >= appliedFilters.value.minPrice);
      }

      if (appliedFilters.value.maxPrice !== null && appliedFilters.value.maxPrice !== "") {
        result = result.filter(listing => listing.price <= appliedFilters.value.maxPrice);
      }

      // Apply date filters
      if (appliedFilters.value.startDate) {
        const filterStartDate = new Date(appliedFilters.value.startDate);
        result = result.filter(listing => {
          const listingEndDate = new Date(listing.endDate);
          // Listing should be available at or after the filter start date
          return listingEndDate >= filterStartDate;
        });
      }

      if (appliedFilters.value.endDate) {
        const filterEndDate = new Date(appliedFilters.value.endDate);
        result = result.filter(listing => {
          const listingStartDate = new Date(listing.startDate);
          // Listing should be available at or before the filter end date
          return listingStartDate <= filterEndDate;
        });
      }

      return result;
    });

    const applyFilters = () => {
      appliedFilters.value = {
        minPrice: filters.value.minPrice,
        maxPrice: filters.value.maxPrice,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
      };
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
        console.log("[FindHousing] No token or user, skipping user ID fetch");
        return;
      }

      const currentUserId = sessionStore.user?.id;
      if (!currentUserId || !isUUID(currentUserId)) {
        console.log(
          "[FindHousing] User ID looks invalid (username?), fetching real ID:",
          currentUserId
        );
        try {
          const userInfoResult = await userInfoApi.getUserInfo();
          console.log("[FindHousing] Fetched user info:", userInfoResult);
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
        console.log("[FindHousing] User ID looks valid (UUID):", currentUserId);
      }
    };

    // Debug: Log session store state on setup
    console.log("[FindHousing] Setup - Session Store State:", {
      hasToken: !!sessionStore.token,
      token: sessionStore.token,
      hasUser: !!sessionStore.user,
      user: sessionStore.user,
      userId: sessionStore.user?.id,
      userType: typeof sessionStore.user?.id,
    });

    const newListing = ref({
      title: "",
      address: "",
      startDate: "",
      endDate: "",
      price: "",
      amenities: [],
    });

    const addAmenity = () => {
      newListing.value.amenities.push({
        title: "",
        distance: "",
      });
    };

    const removeAmenity = (index) => {
      newListing.value.amenities.splice(index, 1);
    };

    const fetchListings = async () => {
      loading.value = true;
      error.value = "";
      try {
        const result = await listings.getAll();
        console.log("[FindHousing] Fetched listings:", result);
        console.log("[FindHousing] Number of listings:", result?.length || 0);

        // Debug: Log each listing's lister ID
        if (result && Array.isArray(result)) {
          result.forEach((listing, index) => {
            console.log(`[FindHousing] Listing ${index}:`, {
              _id: listing._id,
              title: listing.title,
              lister: listing.lister,
              listerType: typeof listing.lister,
            });
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
          // API might return nested structure: {item: {item: "id", tags: []}} or direct objects with _id
          const ids = items
            .map((saved) => {
              console.log(
                "Processing saved item:",
                JSON.stringify(saved, null, 2)
              );
              // API returns: {user: "...", savedItem: {item: "id", tags: [...]}}
              if (saved.savedItem && saved.savedItem.item) {
                console.log(
                  "Using saved.savedItem.item:",
                  saved.savedItem.item
                );
                return saved.savedItem.item;
              } else if (saved._id) {
                console.log("Using saved._id:", saved._id);
                return saved._id;
              } else if (saved.item && saved.item.item) {
                console.log("Using saved.item.item:", saved.item.item);
                return saved.item.item;
              }
              console.log("No ID found for this item");
              return null;
            })
            .filter((id) => id !== null);
          savedItemIds.value = new Set(ids);
          console.log("Saved item IDs set to:", Array.from(savedItemIds.value));
        } else {
          console.log("Result is not an array, clearing saved items");
          savedItemIds.value = new Set();
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

      try {
        // Filter out empty amenities and format them properly
        const validAmenities = newListing.value.amenities
          .filter((a) => a.title && a.distance !== "")
          .map((a) => ({
            title: a.title,
            distance: Number(a.distance),
          }));

        console.log("Valid amenities:", validAmenities);

        const result = await listings.create(
          newListing.value.title,
          validAmenities,
          [], // photos - empty for now
          newListing.value.address,
          newListing.value.startDate,
          newListing.value.endDate,
          newListing.value.price
        );

        console.log("Listing created successfully:", result);

        // Reset form and close modal
        newListing.value = {
          title: "",
          address: "",
          startDate: "",
          endDate: "",
          price: "",
          amenities: [],
        };
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
          await listings.editAddress(listingId, editForm.value.address);
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

        // Handle amenities: deleted, new, and updated
        const oldAmenities = listing.amenities || [];
        const newAmenities = editForm.value.amenities.filter(
          (a) => a.title && a.distance !== ""
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
          if (
            !newAmenity._id &&
            newAmenity.title &&
            newAmenity.distance !== ""
          ) {
            await listings.addAmenity(
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
              await listings.deleteAmenity(listingId, newAmenity._id);
              if (newAmenity.title && newAmenity.distance !== "") {
                await listings.addAmenity(
                  listingId,
                  newAmenity.title,
                  newAmenity.distance
                );
              }
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
        amenities: [],
      };
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
  background: rgb(47, 71, 62);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
}

.filter-container {
  max-width: 1200px;
  margin: 0 auto;
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
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s ease;
}

.favorite-btn:hover {
  transform: scale(1.2);
}

.favorite-btn.is-saved {
  color: #dc3545;
  animation: heartbeat 0.3s ease;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.owner-badge {
  background: rgb(47, 71, 62);
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.8rem;
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
  border-color: rgb(47, 71, 62);
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
