const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class AuthAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Data tidak valid');
        }
        if (response.status === 401) {
          throw new Error('Email atau password salah');
        }
        if (response.status === 409) {
          throw new Error('Email sudah terdaftar');
        }
        if (response.status >= 500) {
          throw new Error('Server error, coba lagi nanti');
        }
        throw new Error('Terjadi kesalahan');
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Email') || error.message.includes('password') || 
          error.message.includes('Data') || error.message.includes('Server')) {
        throw error;
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server');
      }
      
      throw new Error('Terjadi kesalahan jaringan');
    }
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(token) {
    return this.request('/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }
}

const authAPI = new AuthAPI();
export default authAPI;
