import {
  OwnerProfile,
  ResourceItem,
  BookingRequestItem,
  OwnerDashboardStats,
  EarningsBreakdown,
  OwnerRatingsSummary
} from '../types';

// Deployed FastAPI backend on Render
const DEPLOYED_BACKEND_URL = 'https://agricare-resource-owner-api.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:8000';

function getInitialApiBase(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '').trim();
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If in local development
  if (isLocalhost) {
    return envUrl || LOCAL_BACKEND_URL;
  }

  // If in production / deployed environment
  if (isBrowser) {
    // If envUrl is set and is NOT a localhost URL, use it
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    // Fallback to deployed Render backend
    return DEPLOYED_BACKEND_URL;
  }

  // Build time fallback
  return envUrl || DEPLOYED_BACKEND_URL;
}

// Normalize API Base URL so that with or without trailing /api both resolve cleanly
function normalizeApiBase(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }
  return `${trimmed}/api`;
}

export const API_BASE = normalizeApiBase(getInitialApiBase());

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('agricare_owner_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message?.toLowerCase().includes('failed to fetch')) {
      throw new Error(
        `Unable to connect to backend server at ${API_BASE}. Please ensure the backend server is active and reachable.`
      );
    }
    throw err;
  }
}

export const api = {
  // Authentication & Profile
  async login(phone: string, password: string) {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const res = await safeFetch(`${API_BASE}/owner/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || `Login failed (${res.status}). Please check your credentials.`);
    }
    const data = await res.json();
    if (data.user && data.user.role && data.user.role !== 'resource_owner') {
      throw new Error('This account is not a Resource Owner account.');
    }
    if (data.access_token) {
      localStorage.setItem('agricare_owner_token', data.access_token);
      localStorage.setItem('agricare_owner_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(ownerData: Partial<OwnerProfile> & { password: string }) {
    const cleanPhone = (ownerData.phone || '').trim().replace(/\D/g, '').slice(-10);
    const payload = { ...ownerData, phone: cleanPhone, role: 'resource_owner' };
    const res = await safeFetch(`${API_BASE}/owner/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'Mobile number already registered. Please login or use another number.');
    }
    return await res.json();
  },

  async getProfile(): Promise<OwnerProfile> {
    try {
      const res = await safeFetch(`${API_BASE}/owner/profile`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getProfile error', e);
    }
    const cached = localStorage.getItem('agricare_owner_user');
    if (cached) return JSON.parse(cached);
    throw new Error('Owner session not found. Please log in.');
  },

  async updateProfile(data: Partial<OwnerProfile>): Promise<any> {
    const res = await safeFetch(`${API_BASE}/owner/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || `Failed to update profile (${res.status})`);
    }
    const result = await res.json();
    if (result.user) {
      localStorage.setItem('agricare_owner_user', JSON.stringify(result.user));
    }
    return result;
  },

  // Owner Dashboard Stats
  async getDashboardStats(): Promise<OwnerDashboardStats> {
    try {
      const res = await safeFetch(`${API_BASE}/owner/stats`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getDashboardStats error', e);
    }
    return {
      total_resources: 0,
      available_resources: 0,
      pending_bookings: 0,
      confirmed_bookings: 0,
      completed_jobs: 0,
      today_earnings: 0,
      week_earnings: 0,
      month_earnings: 0,
      total_earnings: 0,
      platform_commission_rate: '5%',
      total_platform_fee: 0
    };
  },

  // Resources Management
  async getMyResources(): Promise<ResourceItem[]> {
    try {
      const res = await safeFetch(`${API_BASE}/owner/resources`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.warn('API getMyResources error', e);
    }
    return [];
  },

  async uploadImage(file: File): Promise<{ image_url: string; filename: string }> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file format. Please select an image (JPEG, PNG, WEBP).');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await safeFetch(`${API_BASE}/owner/upload-image`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload image file');
    }

    const data = await res.json();
    let url = data.image_url;
    if (url && url.startsWith('/')) {
      const backendRoot = API_BASE.replace(/\/api\/?$/, '');
      url = `${backendRoot}${url}`;
    }
    return { image_url: url, filename: data.filename || file.name };
  },

  async addResource(resourceData: Partial<ResourceItem>): Promise<any> {
    const res = await safeFetch(`${API_BASE}/owner/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(resourceData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add agricultural resource');
    }
    return res.json();
  },

  async updateResource(resourceId: number, resourceData: Partial<ResourceItem>): Promise<any> {
    const res = await safeFetch(`${API_BASE}/owner/resources/${resourceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(resourceData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update agricultural resource');
    }
    return res.json();
  },

  async toggleAvailability(resourceId: number, availability: string): Promise<any> {
    const res = await safeFetch(`${API_BASE}/owner/resources/${resourceId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ availability })
    });
    if (!res.ok) throw new Error('Failed to update availability');
    return res.json();
  },

  async deleteResource(resourceId: number): Promise<any> {
    const res = await safeFetch(`${API_BASE}/owner/resources/${resourceId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete resource');
    return res.json();
  },

  // Booking Requests & Jobs
  async getBookings(status: string = 'all'): Promise<BookingRequestItem[]> {
    try {
      const res = await safeFetch(`${API_BASE}/owner/bookings?status=${encodeURIComponent(status)}`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.warn('API getBookings error', e);
    }
    return [];
  },

  async acceptBooking(bookingId: string | number): Promise<any> {
    const res = await safeFetch(`${API_BASE}/owner/bookings/${bookingId}/accept`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to accept booking');
    return res.json();
  },

  async rejectBooking(bookingId: string | number, reason?: string): Promise<any> {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    const res = await safeFetch(`${API_BASE}/owner/bookings/${bookingId}/reject${query}`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to reject booking');
    return res.json();
  },

  async completeJob(bookingId: string | number): Promise<any> {
    const res = await safeFetch(`${API_BASE}/owner/bookings/${bookingId}/complete`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to complete job');
    return res.json();
  },

  // Earnings & Ratings
  async getEarnings(): Promise<EarningsBreakdown> {
    try {
      const res = await safeFetch(`${API_BASE}/owner/earnings`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getEarnings error', e);
    }
    return {
      today_earnings: 0,
      week_earnings: 0,
      month_earnings: 0,
      total_earnings: 0,
      platform_commission_rate: '5%',
      total_platform_fee: 0,
      transactions: []
    };
  },

  async getRatings(): Promise<OwnerRatingsSummary> {
    try {
      const res = await safeFetch(`${API_BASE}/owner/ratings`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getRatings error', e);
    }
    return {
      overall_rating: 5.0,
      total_reviews: 0,
      star_breakdown: {
        '5_star': 0,
        '4_star': 0,
        '3_star': 0,
        '2_star': 0,
        '1_star': 0
      },
      reviews: []
    };
  }
};
