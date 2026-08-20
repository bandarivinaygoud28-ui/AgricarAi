# AgriCare AI – Automatic Farm Location Detection & Profile Enhancement

## User Review Required
> [!IMPORTANT]
> The Farmer & Farm Details page will be updated so that farmers only manually input their **Name**, **Phone Number**, **Main Crops**, and **Preferred Language**.
> 
> All location fields (**State**, **District**, **Village / Farm Location**, **Latitude**, **Longitude**) will be automatically populated through the **📍 Detect My Farm Location** button via browser/device GPS and secure reverse-geocoding, with a manual search modal/autocomplete fallback if permissions are denied or if the farmer chooses to search manually.

---

## Proposed Changes

### 1. Types & Models
#### [MODIFY] [frontend/src/types/index.ts](file:///c:/Users/Vinay%20Goud/OneDrive/Desktop/hacaton/frontend/src/types/index.ts)
- Update `FarmerProfile` interface with optional `village?: string`, `latitude?: number`, `longitude?: number`.

#### [MODIFY] [backend/main.py](file:///c:/Users/Vinay%20Goud/OneDrive/Desktop/hacaton/backend/main.py)
- Update `ProfileUpdateRequest` to accept `village`, `latitude`, and `longitude`.
- Update `get_farmer_profile` and `update_farmer_profile` endpoints to store and return `village`, `latitude`, and `longitude` fields.

---

### 2. Frontend Profile Page
#### [MODIFY] [frontend/src/pages/ProfilePage.tsx](file:///c:/Users/Vinay%20Goud/OneDrive/Desktop/hacaton/frontend/src/pages/ProfilePage.tsx)
- Re-architect the Farmer & Farm Details page:
  1. **Manual Inputs Only**:
     - Farmer Full Name
     - Phone Number
     - Main Crops (with quick-select crop tags + custom input)
     - Preferred App & Voice Language (English, Telugu, Hindi)
  2. **Automatic Location Detection**:
     - Add prominent **📍 Detect My Farm Location** button with clean micro-animations and loading states.
     - Browser Geolocation API integration (`navigator.geolocation.getCurrentPosition`) to get real-time GPS coordinates anywhere in India.
     - Reverse-geocoding call via backend/Nominatim to resolve `State`, `District`, `Village/Town`, and `Farm Location`.
     - Automatically populate `state`, `district`, `village`, `location`, `latitude`, `longitude`.
  3. **Location Display**:
     - After detection, show:
       - 📍 Location detected successfully (status badge)
       - State: `[automatic - read only]`
       - District: `[automatic - read only]`
       - Village / Farm Location: `[automatic - read only]`
       - Latitude: `[automatic - read only]`
       - Longitude: `[automatic - read only]`
     - Add **Change Location** button to re-detect or search manually.
  4. **Permission Denied / Error Handling & Manual Search**:
     - If location access is denied or unavailable, show:
       `"Location access is required to automatically detect your farm location."`
     - Provide **🔍 Search Location Manually** button.
     - Inline search with debounced live autocomplete powered by `api.searchLocations` to search any village, town, district, or city across India (e.g., Warangal, Kolar, Guntur, Nashik, etc.).
     - Selecting a location auto-populates State, District, Village, Farm Location, Latitude, and Longitude in read-only format.
  5. **Persistence & App Sync**:
     - On Save, update backend and sync to `localStorage` (`agricare_farm_coords`, `agricare_farm_location_name`, `agricare_farmer_state`, `agricare_farmer_district`, `agricare_farmer_village`, `agricare_farmer_crops`, etc.).

---

### 3. Location Synchronization Across AgriCare Modules
#### [MODIFY] [frontend/src/pages/WeatherPage.tsx](file:///c:/Users/Vinay%20Goud/OneDrive/Desktop/hacaton/frontend/src/pages/WeatherPage.tsx)
- Use the farmer's saved coordinates and location name on load to fetch LIVE meteorological data for their exact farm.

#### [MODIFY] [frontend/src/pages/MarketPricesPage.tsx](file:///c:/Users/Vinay%20Goud/OneDrive/Desktop/hacaton/frontend/src/pages/MarketPricesPage.tsx)
- Automatically default state/district filters to the farmer's detected state and district from profile.

#### [MODIFY] [frontend/src/pages/FarmerNewsPage.tsx](file:///c:/Users/Vinay%20Goud/OneDrive/Desktop/hacaton/frontend/src/pages/FarmerNewsPage.tsx)
- Prioritize news relevant to the farmer's detected state/district and crops.

#### [MODIFY] [frontend/src/pages/AssistantPage.tsx](file:///c:/Users/Vinay%20Goud/OneDrive/Desktop/hacaton/frontend/src/pages/AssistantPage.tsx)
- Pass the farmer's detected farm location into assistant queries for location-aware agricultural guidance.

#### [MODIFY] [frontend/src/pages/DashboardPage.tsx](file:///c:/Users/Vinay%20Goud/OneDrive/Desktop/hacaton/frontend/src/pages/DashboardPage.tsx)
- Utilize the farmer's detected location and coordinates for weather summary and market prices on the dashboard.

---

## Verification Plan

### Automated Tests
- Run backend verification scripts:
  ```powershell
  python backend/test_weather_live.py
  python backend/test_suite.py
  ```
- Run frontend typecheck and build validation:
  ```powershell
  cd frontend; npm run build
  ```

### Manual Verification
1. Open Profile Page: Verify only Full Name, Phone Number, Main Crops, and Preferred Language are editable manually.
2. Click **📍 Detect My Farm Location**: Test browser geolocation flow, reverse geocoding to village/district/state, read-only location card, latitude/longitude display, and **Change Location** button.
3. Test **🔍 Search Location Manually**: Test searching different Indian locations (e.g., Warangal, Kolar, Guntur, Nashik) and selecting one to populate read-only fields.
4. Save profile and verify:
   - Weather page loads live forecast for the detected coordinates.
   - Market prices page defaults to the detected state/district.
   - News page prioritizes the farmer's state/crops.
   - Assistant provides location-aware responses.
