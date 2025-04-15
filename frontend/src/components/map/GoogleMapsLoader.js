// src/components/map/GoogleMapsLoader.js

// Create a cache object in window to maintain state between calls
if (!window._googleMapsApiCache) {
    window._googleMapsApiCache = {
      loading: false,
      loaded: false,
      promise: null
    };
  }
  
  /**
   * Loads the Google Maps API with specified libraries
   * @param {string} apiKey - Google Maps API key
   * @param {Array<string>} libraries - Array of library names to load
   * @returns {Promise} - Promise that resolves when the API is loaded
   */
  export const loadGoogleMapsApi = (apiKey, libraries = ['places']) => {
    // If already loaded, return resolved promise
    if (window._googleMapsApiCache.loaded && window.google && window.google.maps) {
      return Promise.resolve();
    }
    
    // If currently loading, return the existing promise
    if (window._googleMapsApiCache.loading && window._googleMapsApiCache.promise) {
      return window._googleMapsApiCache.promise;
    }
    
    // Start loading
    window._googleMapsApiCache.loading = true;
    window._googleMapsApiCache.promise = new Promise((resolve, reject) => {
      // Create unique callback name to avoid collisions
      const callbackName = `googleMapsCallback_${Date.now()}`;
      
      // Set unique callback to avoid conflicts
      window[callbackName] = () => {
        window._googleMapsApiCache.loaded = true;
        window._googleMapsApiCache.loading = false;
        delete window[callbackName];
        resolve();
      };
      
      // Create script element
      const script = document.createElement('script');
      const librariesParam = libraries.join(',');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesParam}&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      
      // Handle errors
      script.onerror = (error) => {
        window._googleMapsApiCache.loading = false;
        delete window[callbackName];
        reject(new Error('Error loading Google Maps API'));
      };
      
      // Set timeout to reject promise if loading takes too long
      const timeoutId = setTimeout(() => {
        if (!window._googleMapsApiCache.loaded) {
          window._googleMapsApiCache.loading = false;
          delete window[callbackName];
          reject(new Error('Timeout loading Google Maps API'));
        }
      }, 20000); // 20 second timeout
      
      // Add cleanup for successful load
      script.onload = () => {
        clearTimeout(timeoutId);
        // Note: We don't resolve here - we wait for the callback
      };
      
      // Add to document
      document.head.appendChild(script);
    });
    
    return window._googleMapsApiCache.promise;
  };
  
  /**
   * Creates a geocoder instance and geocodes an address
   * @param {string} address - Address to geocode
   * @returns {Promise} - Promise that resolves with geocoding results
   */
  export const geocodeAddress = (address) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }
      
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed with status: ${status}`));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  
  /**
   * Reverse geocodes coordinates to get an address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise} - Promise that resolves with reverse geocoding results
   */
  export const reverseGeocode = (lat, lng) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }
      
      try {
        // Validate coordinates
        if (typeof lat !== 'number' || isNaN(lat) || typeof lng !== 'number' || isNaN(lng)) {
          reject(new Error('Invalid coordinates: lat and lng must be numbers'));
          return;
        }
        
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results);
          } else {
            reject(new Error(`Reverse geocoding failed with status: ${status}`));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  
  export default {
    loadGoogleMapsApi,
    geocodeAddress,
    reverseGeocode
  };