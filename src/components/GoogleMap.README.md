# GoogleMap Component

A Vue 3 component that integrates Google Maps API with automatic API key fetching from the backend and support for displaying housing listings as markers.

## Prerequisites

1. **Install the Google Maps loader package** (already done):
   ```bash
   npm install @googlemaps/js-api-loader
   ```

2. **Backend API endpoint** for fetching the Maps API key:
   ```
   POST /api/config/mapsKey
   ```
   Should return: `{ apiKey: "your-google-maps-api-key" }`

3. **Create a Map ID** in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "Google Maps Platform" > "Map Management"
   - Click "Create Map ID"
   - Configure your map style (or use default)
   - Copy the Map ID

4. **Set environment variable** (optional - will use backend key if not set):
   ```bash
   # .env file
   VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here  # Fallback if backend fails
   ```

## Usage Examples

### Example 1: Auto-fetch and Display All Listings

The simplest usage - automatically fetches API key from backend and displays all listings:

```vue
<template>
  <div style="height: 500px;">
    <GoogleMap 
      :fetchListings="true"
      @marker-click="handleMarkerClick"
    />
  </div>
</template>

<script>
import GoogleMap from '@/components/GoogleMap.vue';

export default {
  components: { GoogleMap },
  methods: {
    handleMarkerClick(listing) {
      console.log('Clicked listing:', listing);
      // Show listing details, etc.
    }
  }
};
</script>
```

### Example 2: Custom Markers (Manual Data)

Pass your own markers with custom data:

```vue
<template>
  <div style="height: 500px;">
    <GoogleMap 
      :center="{ lat: 42.3601, lng: -71.0942 }"
      :zoom="13"
      :markers="customMarkers"
      @marker-click="handleMarkerClick"
    />
  </div>
</template>

<script>
import GoogleMap from '@/components/GoogleMap.vue';

export default {
  components: { GoogleMap },
  data() {
    return {
      customMarkers: [
        {
          lat: 42.3601,
          lng: -71.0942,
          title: 'MIT Campus',
          info: 'Massachusetts Institute of Technology'
        },
        {
          lat: 42.3736,
          lng: -71.1097,
          title: 'Harvard Square',
          info: 'Harvard University Area'
        }
      ]
    };
  },
  methods: {
    handleMarkerClick(markerData) {
      console.log('Clicked marker:', markerData);
    }
  }
};
</script>
```

### Example 3: Integration with FindHousing Page

Add map view to your existing FindHousing.vue:

```vue
<template>
  <main>
    <!-- Existing content -->
    
    <!-- Add Map Section -->
    <section class="map-section">
      <h2>Map View</h2>
      <div style="height: 600px;">
        <GoogleMap 
          :fetchListings="true"
          :zoom="12"
          :center="{ lat: 42.3601, lng: -71.0942 }"
          @marker-click="showListingDetails"
        />
      </div>
    </section>
  </main>
</template>

<script>
import GoogleMap from '@/components/GoogleMap.vue';

export default {
  components: { GoogleMap },
  methods: {
    showListingDetails(listing) {
      // Scroll to the listing or open a modal
      console.log('Show details for:', listing.title);
    }
  }
};
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | Object | `{ lat: 42.3601, lng: -71.0942 }` | Map center (MIT coordinates) |
| `zoom` | Number | `12` | Initial zoom level |
| `markers` | Array | `[]` | Custom markers to display. Each marker should have `lat`, `lng`, and optionally `title` |
| `mapId` | String | `VITE_GOOGLE_MAPS_MAP_ID` | Google Maps Map ID (required for Advanced Markers) |
| `fetchListings` | Boolean | `false` | If true, automatically fetches listings from `/api/Listing/getAllListings` |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `marker-click` | Object | Emitted when a marker is clicked. Payload is the marker data or listing object |

## Methods (Exposed)

```javascript
// Refresh listings on the map (only works if fetchListings is true)
this.$refs.mapComponent.refreshListings();
```

## API Requirements

### Backend Endpoints

1. **Get Maps API Key**
   ```
   POST /api/config/mapsKey
   Headers: { Authorization: Bearer <token> }
   Response: { apiKey: "AIza..." }
   ```

2. **Get All Listings** (if using `fetchListings` prop)
   ```
   POST /api/Listing/getAllListings
   Headers: { Authorization: Bearer <token> }
   Response: { listings: [...] } or [...]
   ```

### Listing Data Format

For automatic marker placement, listings should include:
```javascript
{
  _id: "listing-id",
  title: "Listing Title",
  latitude: 42.3601,
  longitude: -71.0942,
  address: "123 Main St",
  // ... other fields
}
```

## Styling

The component is fully responsive and includes:
- Loading state with centered message
- Error state with red background
- 400px minimum height
- Rounded corners (8px border-radius)

Custom styling example:
```vue
<style scoped>
.map-section {
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.map-section h2 {
  margin-bottom: 1rem;
  color: #333;
}
</style>
```

## Troubleshooting

### "Error loading map: Google Maps API key not available"
- Ensure backend endpoint `/api/config/mapsKey` is working
- Or set `VITE_GOOGLE_MAPS_API_KEY` in your `.env` file

### Markers not showing
- Check that listings have `latitude` and `longitude` fields
- Verify Map ID is correct in environment variables
- Check browser console for errors

### Map not loading
- Ensure you have a valid Google Maps API key
- Check that the API key has Maps JavaScript API enabled
- Verify billing is enabled in Google Cloud Console

## Full Implementation Checklist

- [x] Install `@googlemaps/js-api-loader` package
- [ ] Create backend endpoint: `POST /api/config/mapsKey`
- [ ] Create Map ID in Google Cloud Console
- [ ] Add Map ID to `.env`: `VITE_GOOGLE_MAPS_MAP_ID=your_map_id`
- [ ] Ensure listings have `latitude` and `longitude` fields
- [ ] Import and use GoogleMap component in your page
- [ ] Test marker clicks and interactions
