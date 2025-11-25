/**
 * API utility for making requests to the backend
 */

import axios from "axios";
import { useSessionStore } from "../stores/session.js";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Make an API request
 * @param {string} endpoint - The API endpoint (e.g., '/Sessioning/create')
 * @param {object} body - The request body
 * @param {number} timeout - Request timeout in milliseconds (default: 30000)
 * @returns {Promise<object>} The response data
 */

export async function apiRequest(endpoint, body = {}, timeout = 30000) {
  const fullPath = `${API_BASE}${endpoint}`;
  const sessionStore = useSessionStore();
  const headers = {
    "Content-Type": "application/json",
  };
  if (sessionStore.token) {
    headers["Authorization"] = `Bearer ${sessionStore.token}`;
  }
  try {
    console.log("API Request:", {
      endpoint: fullPath,
      body,
      sessionToken: sessionStore.token,
      hasToken: !!sessionStore.token,
    });
    const response = await axios.post(fullPath, body, {
      withCredentials: false,
      timeout,
      headers,
    });
    console.log("API Response data:", response.data);
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error("API request timed out after", timeout, "ms");
      throw new Error("Request timed out");
    }
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    console.error("API request error:", error);
    throw error;
  }
}

// Session ID helpers
function setSessionId(sessionId) {
  localStorage.setItem("sessionId", sessionId);
}
function getSessionId() {
  return localStorage.getItem("sessionId");
}
function removeSessionId() {
  localStorage.removeItem("sessionId");
}

/**
 * Authentication API calls
 */
// Removed duplicate import
export const auth = {
  async register(username, password, age, gender, affiliation, emailAddress) {
    return await apiRequest("/createAccount", {
      username,
      password,
      age,
      gender,
      affiliation,
      emailAddress,
    });
  },

  async login(username, password) {
    return await apiRequest("/PasswordAuth/authenticate", {
      username,
      password,
    });
  },

  async createSession(userId) {
    return await apiRequest("/Sessioning/create", { user: userId });
  },

  async logout() {
    const sessionStore = useSessionStore();
    return await apiRequest("/Sessioning/delete", {
      session: sessionStore.token,
    });
  },

  async changePassword(username, currentPass, newPass) {
    const sessionStore = useSessionStore();
    return await apiRequest("/PasswordAuth/changePassword", {
      username,
      currentPass,
      newPass,
      session: sessionStore.token,
    });
  },

  async deleteAccount(password) {
    const sessionStore = useSessionStore();
    return await apiRequest("/PasswordAuth/deleteAccount", {
      password,
      session: sessionStore.token,
    });
  },
};

/**
 * SavedItems API calls
 */
export const savedItems = {
  async addItem(item) {
    const sessionStore = useSessionStore();
    return await apiRequest("/SavedItems/addUserRecord", {
      item,
      session: sessionStore.token,
    });
  },

  async removeItem(user, item) {
    const sessionStore = useSessionStore();
    return await apiRequest("/SavedItems/removeItem", {
      user,
      item,
      session: sessionStore.token,
    });
  },

  async getSavedItems(user) {
    const sessionStore = useSessionStore();
    return await apiRequest("/SavedItems/_getSavedItems", {
      user,
      session: sessionStore.token,
    });
  },

  async addTag(user, item, tag) {
    const sessionStore = useSessionStore();
    return await apiRequest("/SavedItems/addItemTag", {
      user,
      item,
      tag,
      session: sessionStore.token,
    });
  },

  async removeTag(user, item, tag) {
    const sessionStore = useSessionStore();
    return await apiRequest("/SavedItems/removeItemTag", {
      user,
      item,
      tag,
      session: sessionStore.token,
    });
  },
};

/**
 * Reviewing API calls
 */
export const reviews = {
  async create(item, ranking, blurb) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Reviewing/create", {
      item,
      ranking,
      blurb,
      session: sessionStore.token,
    });
  },

  async deleteReview(review) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Reviewing/deleteReview", {
      review,
      session: sessionStore.token,
    });
  },

  async editRanking(review, ranking) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Reviewing/editRanking", {
      review,
      ranking,
      session: sessionStore.token,
    });
  },

  async editBlurb(review, blurb) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Reviewing/editBlurb", {
      review,
      blurb,
      session: sessionStore.token,
    });
  },

  async getReviewsByItem(item) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Reviewing/_getReviewByItem", {
      item,
      session: sessionStore.token,
    });
  },

  async getReviewsFromUser(user) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Reviewing/_getReviewFromUser", {
      user,
      session: sessionStore.token,
    });
  },
};

/**
 * UserInfo API calls
 */
export const userInfo = {
  async setInfo(user, age, affiliation, gender, emailAddress) {
    const sessionStore = useSessionStore();
    return await apiRequest("/UserInfo/setInfo", {
      user,
      age,
      affiliation,
      gender,
      emailAddress,
      session: sessionStore.token,
    });
  },

  async deleteInfo(user) {
    const sessionStore = useSessionStore();
    return await apiRequest("/UserInfo/deleteInfo", {
      user,
      session: sessionStore.token,
    });
  },

  async updateAge(user, age) {
    const sessionStore = useSessionStore();
    return await apiRequest("/UserInfo/updateAge", {
      user,
      age,
      session: sessionStore.token,
    });
  },

  async updateAffiliation(user, affiliation) {
    const sessionStore = useSessionStore();
    return await apiRequest("/UserInfo/updateAffiliation", {
      user,
      affiliation,
      session: sessionStore.token,
    });
  },

  async updateGender(user, gender) {
    const sessionStore = useSessionStore();
    return await apiRequest("/UserInfo/updateGender", {
      user,
      gender,
      session: sessionStore.token,
    });
  },

  async updateEmailAddress(user, emailAddress) {
    const sessionStore = useSessionStore();
    return await apiRequest("/UserInfo/updateEmailAddress", {
      user,
      emailAddress,
      session: sessionStore.token,
    });
  },
};

/**
 * Listing API calls
 */
export const listings = {
  async create(title, amenities, photos, address, startDate, endDate, price) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/create", {
      title,
      amenities,
      photos,
      address,
      startDate,
      endDate,
      price,
      session: sessionStore.token,
    });
  },

  async delete(listingId) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/delete", {
      listingId,
      session: sessionStore.token,
    });
  },

  async getById(listingId) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/getListingById", {
      listingId,
      session: sessionStore.token,
    });
  },

  async getAll() {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/getAllListings", {
      session: sessionStore.token,
    });
  },

  async editTitle(listingId, newTitle) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/editTitle", {
      listingId,
      newTitle,
      session: sessionStore.token,
    });
  },

  async editAddress(listingId, newAddress) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/editAddress", {
      listingId,
      newAddress,
      session: sessionStore.token,
    });
  },

  async editStartDate(listingId, newStartDate) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/editStartDate", {
      listingId,
      newStartDate,
      session: sessionStore.token,
    });
  },

  async editEndDate(listingId, newEndDate) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/editEndDate", {
      listingId,
      newEndDate,
      session: sessionStore.token,
    });
  },

  async editPrice(listingId, newPrice) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/editPrice", {
      listingId,
      newPrice,
      session: sessionStore.token,
    });
  },

  async addPhoto(listingId, photo) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/addPhoto", {
      listingId,
      photo,
      session: sessionStore.token,
    });
  },

  async deletePhoto(listingId, photoId) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/deletePhoto", {
      listingId,
      photoId,
      session: sessionStore.token,
    });
  },

  async addAmenity(listingId, title, distance) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/addAmenity", {
      listingId,
      title,
      distance,
      session: sessionStore.token,
    });
  },

  async deleteAmenity(listingId, amenityId) {
    const sessionStore = useSessionStore();
    return await apiRequest("/Listing/deleteAmenity", {
      listingId,
      amenityId,
      session: sessionStore.token,
    });
  },
};

/**
 * RoommatePosting API calls
 */
export const roommatePostings = {
  async create(postingData) {
    const sessionStore = useSessionStore();
    return await apiRequest("/RoommatePosting/create", {
      ...postingData,
      session: sessionStore.token,
    });
  },

  async delete(postingId) {
    const sessionStore = useSessionStore();
    return await apiRequest("/RoommatePosting/delete", {
      postingId,
      session: sessionStore.token,
    });
  },

  async getAll() {
    const sessionStore = useSessionStore();
    return await apiRequest("/RoommatePosting/getAllPostings", {
      session: sessionStore.token,
    });
  },
};

export default {
  apiRequest,
  auth,
  savedItems,
  reviews,
  userInfo,
  listings,
  roommatePostings,
};
