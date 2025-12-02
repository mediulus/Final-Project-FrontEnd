<template>
  <div class="map-container">
    <div v-if="isLoading" class="map-loading">
      <p>Loading map...</p>
    </div>
    <div v-else-if="error" class="map-error">
      <p>Error loading map: {{ error }}</p>
    </div>
    <div v-show="!isLoading && !error" ref="mapDiv" class="map-viewport"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { apiRequest } from '../utils/api.js';

export default {
  name: 'GoogleMap',
  props: {
    center: {
      type: Object,
      default: () => ({ lat: 42.3601, lng: -71.0942 }) // MIT coordinates
    },
    zoom: {
      type: Number,
      default: 12
    },
    markers: {
      type: Array,
      default: () => []
    },
    mapId: {
      type: String,
      default: () => import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || ''
    },
    fetchListings: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const mapDiv = ref(null);
    const isLoading = ref(true);
    const error = ref(null);
    let map = null;
    let googleMarkers = [];
    let Map = null;
    let AdvancedMarkerElement = null;

    /**
     * Fetch the Google Maps API key from the backend
     */
    const fetchApiKey = async () => {
      try {
        const response = await apiRequest('/config/mapsKey', {});
        return response.apiKey;
      } catch (err) {
        console.error('Error fetching API key:', err);
        // Fallback to environment variable if backend fails
        return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      }
    };

    /**
     * Fetch all listings from the backend
     */
    const fetchListingsData = async () => {
      try {
        const response = await apiRequest('/Listing/getAllListings', {});
        return response.listings || response || [];
      } catch (err) {
        console.error('Error fetching listings:', err);
        return [];
      }
    };

    /**
     * Load Google Maps script manually
     */
    const loadGoogleMapsScript = (apiKey) => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        // Check if script is already in DOM
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          existingScript.addEventListener('load', resolve);
          existingScript.addEventListener('error', reject);
          return;
        }

        // Create and inject script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Google Maps script'));
        document.head.appendChild(script);
      });
    };

    /**
     * Initialize the Google Maps API
     */
    const initializeGoogleMaps = async () => {
      try {
        // Step 1: Fetch API key from backend
        const apiKey = await fetchApiKey();
        
        if (!apiKey) {
          throw new Error('Google Maps API key not available');
        }

        console.log('Initializing Google Maps with API key:', apiKey.substring(0, 10) + '...');

        // Step 2: Load Google Maps script
        await loadGoogleMapsScript(apiKey);

        // Step 3: Wait for google.maps to be available
        let retries = 0;
        while ((!window.google || !window.google.maps) && retries < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }

        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps failed to load');
        }

        // Step 4: Get the classes we need
        Map = google.maps.Map;
        // Use standard Marker class instead of AdvancedMarkerElement
        AdvancedMarkerElement = google.maps.Marker;

        if (!AdvancedMarkerElement) {
          console.error('Google Maps Marker class not available');
          return false;
        }

        console.log('Google Maps initialized with standard Marker class');
        return true;
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        error.value = err.message;
        return false;
      }
    };

    /**
     * Initialize the map instance
     */
    const initMap = async () => {
      if (!mapDiv.value || !Map) {
        console.error('Map div not available or Google Maps not loaded');
        return;
      }

      try {
        // Initialize the map
        map = new Map(mapDiv.value, {
          zoom: props.zoom,
          center: props.center,
          mapId: props.mapId,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        // Fetch and add listings if requested
        if (props.fetchListings) {
          const listings = await fetchListingsData();
          await addListingsAsMarkers(listings);
        } else {
          // Add markers from props (even if empty initially)
          console.log('Initial marker count:', props.markers.length);
          if (props.markers.length > 0) {
            updateMarkers();
          }
        }

        isLoading.value = false;
      } catch (err) {
        console.error('Error creating map:', err);
        error.value = err.message;
        isLoading.value = false;
      }
    };

    /**
     * Add listings as markers on the map
     */
    const addListingsAsMarkers = async (listings) => {
      if (!map || !AdvancedMarkerElement) return;

      // Clear existing markers
      clearMarkers();

      // Add marker for each listing with coordinates
      listings.forEach(listing => {
        if (listing.latitude && listing.longitude) {
          try {
            const marker = new AdvancedMarkerElement({
              position: { lat: listing.latitude, lng: listing.longitude },
              map: map,
              title: listing.title || 'Listing',
            });

            // Add click listener
            marker.addListener('click', () => {
              emit('marker-click', listing);
            });

            googleMarkers.push(marker);
          } catch (err) {
            console.error('Error creating marker for listing:', listing, err);
          }
        }
      });
    };

    /**
     * Update markers from props
     */
    const updateMarkers = () => {
      if (!map) {
        console.warn('Map not initialized, cannot update markers');
        return;
      }
      
      if (!AdvancedMarkerElement) {
        console.warn('AdvancedMarkerElement not available, cannot create markers');
        return;
      }

      console.log('Updating markers, count:', props.markers.length);

      // Clear existing markers
      clearMarkers();

      // Add new markers
      props.markers.forEach((markerData, index) => {
        if (markerData.lat && markerData.lng) {
          try {
            const marker = new AdvancedMarkerElement({
              position: { lat: markerData.lat, lng: markerData.lng },
              map: map,
              title: markerData.title || '',
            });

            // Add click listener if there's additional info
            marker.addListener('click', () => {
              console.log('Marker clicked:', markerData);
              emit('marker-click', markerData);
            });

            googleMarkers.push(marker);
            console.log(`Created marker ${index + 1}/${props.markers.length}:`, {
              lat: markerData.lat,
              lng: markerData.lng,
              title: markerData.title
            });
          } catch (err) {
            console.error('Error creating marker:', markerData, err);
          }
        } else {
          console.warn('Marker missing lat/lng:', markerData);
        }
      });
      
      console.log('Total markers created:', googleMarkers.length);
    };

    /**
     * Clear all markers from the map
     */
    const clearMarkers = () => {
      googleMarkers.forEach(marker => {
        marker.setMap(null);
      });
      googleMarkers = [];
    };

    /**
     * Refresh listings on the map
     */
    const refreshListings = async () => {
      if (!props.fetchListings) return;
      
      const listings = await fetchListingsData();
      await addListingsAsMarkers(listings);
    };

    onMounted(async () => {
      try {
        isLoading.value = true;
        const success = await initializeGoogleMaps();
        
        if (success) {
          await initMap();
        } else {
          isLoading.value = false;
        }
      } catch (err) {
        console.error('Error in component mount:', err);
        error.value = err.message;
        isLoading.value = false;
      }
    });

    // Watch for center changes
    watch(() => props.center, (newCenter) => {
      if (map) {
        map.setCenter(newCenter);
      }
    }, { deep: true });

    // Watch for zoom changes
    watch(() => props.zoom, (newZoom) => {
      if (map) {
        map.setZoom(newZoom);
      }
    });

    // Watch for marker changes
    watch(() => props.markers, (newMarkers, oldMarkers) => {
      if (!props.fetchListings) {
        console.log('Markers changed:', {
          oldCount: oldMarkers?.length || 0,
          newCount: newMarkers?.length || 0
        });
        updateMarkers();
      }
    }, { deep: true, immediate: false });

    return {
      mapDiv,
      isLoading,
      error,
      refreshListings
    };
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-viewport {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.map-loading,
.map-error {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.map-loading p {
  color: #666;
  font-size: 16px;
}

.map-error {
  background-color: #fee;
}

.map-error p {
  color: #c33;
  font-size: 14px;
  padding: 20px;
  text-align: center;
}
</style>
