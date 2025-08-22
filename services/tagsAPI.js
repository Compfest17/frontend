const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class TagsAPI {
  /**
   * Search tags for autocomplete
   */
  static async searchTags(query, limit = 10) {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE_URL}/api/tags/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search tags');
      }

      return data;
    } catch (error) {
      console.error('Error searching tags:', error);
      throw error;
    }
  }

  /**
   * Get popular tags
   */
  static async getPopularTags(limit = 20) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE_URL}/api/tags/popular?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch popular tags');
      }

      return data;
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      throw error;
    }
  }

  /**
   * Create or get existing tag
   */
  static async createTag(name) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create tag');
      }

      return data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }
}

export default TagsAPI;
