import apiConfig from "../config/api.js";

/**
 * Creates a new listing
 * @param {Object} listingData - The listing data
 * @param {string} listingData.lister - The lister/user ID
 * @param {string} listingData.title - The listing title
 * @param {Array} listingData.amenities - Array of amenities
 * @param {Array} listingData.photos - Array of photo objects
 * @param {string} listingData.address - The listing address
 * @param {string} listingData.startDate - Start date in ISO 8601 format
 * @param {string} listingData.endDate - End date in ISO 8601 format
 * @param {number} listingData.price - Price per week
 * @returns {Promise<Object>} The created listing
 */
export async function createListing(listingData) {
  const response = await fetch(`${apiConfig.baseURL}/api/Listing/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create listing");
  }

  return data;
}

/**
 * Gets all listings
 * @returns {Promise<Array>} Array of all listings
 */
export async function getAllListings() {
  const response = await fetch(
    `${apiConfig.baseURL}/api/Listing/getAllListings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch listings");
  }

  return data;
}

/**
 * Gets a listing by ID
 * @param {string} listingId - The listing ID
 * @returns {Promise<Array>} Array containing the listing
 */
export async function getListingById(listingId) {
  const response = await fetch(
    `${apiConfig.baseURL}/api/Listing/getListingById`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listingId }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch listing");
  }

  return data;
}

/**
 * Deletes a listing
 * @param {string} listingId - The listing ID to delete
 * @returns {Promise<Object>} Empty object on success
 */
export async function deleteListing(listingId) {
  const response = await fetch(`${apiConfig.baseURL}/api/Listing/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ listingId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete listing");
  }

  return data;
}

