const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class GeocodingAPI {
  /**
   * Search addresses using OSM Nominatim
   */
  static async searchAddresses(query, limit = 5, token = null) {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/geocoding/search?${params}`, {
        headers
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search addresses');
      }

      return data;
    } catch (error) {
      console.error('Error searching addresses via backend, trying direct:', error);
      
      try {
        return await this.searchAddressesDirect(query, limit);
      } catch (fallbackError) {
        console.error('Direct search also failed:', fallbackError);
        throw new Error('Address search service unavailable');
      }
    }
  }

  /**
   * Reverse geocoding - convert coordinates to address
   */
  static async reverseGeocode(lat, lon, token = null) {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString()
      });

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/geocoding/reverse?${params}`, {
        headers
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reverse geocode');
      }

      return data;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  /**
   * Validate coordinates
   */
  static async validateCoordinates(lat, lon, token = null) {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString()
      });

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/geocoding/validate?${params}`, {
        headers
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate coordinates');
      }

      return data;
    } catch (error) {
      console.error('Error validating coordinates:', error);
      throw error;
    }
  }

  /**
   * Direct OSM Nominatim search (client-side fallback)
   */
  static async searchAddressesDirect(query, limit = 5) {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: limit.toString(),
        countrycodes: 'id',
        addressdetails: '1'
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'User-Agent': 'GatotKota-Frontend/1.0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search addresses');
      }

      const data = await response.json();

      return {
        success: true,
        data: data.map(item => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          address: {
            road: item.address?.road,
            city: item.address?.city || item.address?.town || item.address?.village,
            state: item.address?.state,
            postcode: item.address?.postcode,
            country: item.address?.country
          }
        })),
        count: data.length
      };
    } catch (error) {
      console.error('Error searching addresses directly:', error);
      throw error;
    }
  }
}

export default GeocodingAPI;
