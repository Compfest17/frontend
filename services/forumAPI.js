const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ForumAPI {
  /**
   * Get authentication headers
   */
  static getAuthHeaders(token = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Create a new forum post
   */
  static async createForum(forumData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forums`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(forumData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create forum post');
      }

      return data;
    } catch (error) {
      console.error('Error creating forum:', error);
      throw error;
    }
  }

  /**
   * Get forums with pagination and filters
   */
  static async getForums(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/api/forums?${queryParams}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch forums');
      }

      return data;
    } catch (error) {
      console.error('Error fetching forums:', error);
      throw error;
    }
  }

  /**
   * Get single forum by ID
   */
  static async getForumById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/${id}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch forum');
      }

      return data;
    } catch (error) {
      console.error('Error fetching forum:', error);
      throw error;
    }
  }
}

export default ForumAPI;
