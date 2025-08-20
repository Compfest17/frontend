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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch forums');
      }

      return result;
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

  /**
   * Get comments for a forum post
   */
  static async getComments(forumId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/api/forums/${forumId}/comments?${queryParams}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch comments');
      }

      return data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  static async voteComment(commentId, action, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/comments/${commentId}/vote`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to vote comment');
      }
      return data;
    } catch (error) {
      console.error('Error voting comment:', error);
      throw error;
    }
  }

  /**
   * Create a comment on a forum post
   */
  static async createComment(forumId, commentData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/${forumId}/comments`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(commentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create comment');
      }

      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Vote on a forum post
   */
  static async votePost(forumId, action, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/${forumId}/vote`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to vote on post');
      }

      return data;
    } catch (error) {
      console.error('Error voting on post:', error);
      throw error;
    }
  }

  /**
   * Toggle bookmark on a forum post
   */
  static async toggleBookmark(forumId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/${forumId}/bookmark`, {
        method: 'POST',
        headers: this.getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle bookmark');
      }

      return data;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  /**
   * Get user bookmarks
   */
  static async getUserBookmarks(token, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/api/forums/bookmarks?${queryParams}`, {
        headers: this.getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get bookmarks');
      }

      return data;
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      throw error;
    }
  }

  /**
   * Check if a specific post is bookmarked by user
   */
  static async checkBookmarkStatus(forumId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/${forumId}/bookmark/status`, {
        headers: this.getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check bookmark status');
      }

      return data.data.bookmarked; 
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      throw error;
    }
  }

  /**
   * 🔥 Get trending posts with advanced algorithm
   */
  static async getTrending(limit = 10) {
    try {
      console.log(`🔥 Fetching top ${limit} trending posts...`);
      
      const response = await fetch(`${API_BASE_URL}/api/forums/trending?limit=${limit}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch trending posts');
      }

      console.log(`📊 Got ${result.data?.length || 0} trending posts`);
      return result;
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }
}

export default ForumAPI;
