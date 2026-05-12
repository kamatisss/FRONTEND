import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Accept': 'application/json' },
});

// ─── Interceptors ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => { 
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`); 
    const authTokens = localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null;
    if (authTokens && authTokens.access) {
      config.headers.Authorization = `Bearer ${authTokens.access}`;
    }
    return config; 
  },
  (error) => { console.error('❌ Request error:', error); return Promise.reject(error); }
);

api.interceptors.response.use(
  (response) => { console.log(`✅ ${response.status} ${response.config.url}`); return response; },
  (error) => {
    if (error.response) console.error(`❌ ${error.response.status}:`, error.response.data);
    else if (error.request) console.error('❌ No response — is Django running?');
    else console.error('❌', error.message);
    return Promise.reject(error);
  }
);

// ─── Depth Map ───────────────────────────────────────────────────
export const generateDepthMap = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  try {
    const res = await api.post('/generate-depth/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (p) => console.log(`⏳ Upload: ${Math.round((p.loaded * 100) / p.total)}%`),
    });
    const data = res.data;
    const required = ['depth_map_url', 'normal_map_url', 'rock_mask_url', 'grass_mask_url'];
    const missing = required.filter(k => !data[k]);
    if (missing.length) throw new Error(`Missing: ${missing.join(', ')}`);
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message || 'Depth generation failed');
  }
};

// ─── Inventory ────────────────────────────────────────────────────
export const getInventoryItems = async (category = null) => {
  const params = category ? { category } : {};
  const res = await api.get('/inventory/', { params });
  return res.data;
};

export const getInventoryItem = async (id) => {
  const res = await api.get(`/inventory/${id}/`);
  return res.data;
};

export const createInventoryItem = async (data) => {
  const res = await api.post('/inventory/', data);
  return res.data;
};

export const updateInventoryItem = async (id, data) => {
  const res = await api.put(`/inventory/${id}/`, data);
  return res.data;
};

export const deleteInventoryItem = async (id) => {
  const res = await api.delete(`/inventory/${id}/`);
  return res.data;
};

// ─── Designs CRUD ────────────────────────────────────────────────
export const listDesigns = async () => {
  const res = await api.get('/designs/');
  return res.data;
};

export const loadDesign = async (id) => {
  const res = await api.get(`/designs/${id}/`);
  return res.data;
};

export const saveDesign = async (designData) => {
  if (designData.id) {
    const res = await api.put(`/designs/${designData.id}/`, designData);
    return res.data;
  }
  const res = await api.post('/designs/', designData);
  return res.data;
};

export const deleteDesign = async (id) => {
  await api.delete(`/designs/${id}/`);
};

export const duplicateDesign = async (id) => {
  const res = await api.post(`/designs/${id}/duplicate/`);
  return res.data;
};

export const submitDesign = async (id) => {
  const res = await api.patch(`/designs/${id}/submit/`);
  return res.data;
};

// ─── Placed Item Rotation (PATCH) ────────────────────────────────
// Sends a PATCH request to update the rotation.y value for a placed item.
// The backend stores rotation_y as a FloatField (radians).
// Endpoint: PATCH /api/designs/items/<itemId>/
export const patchItemRotation = async (productId, itemId, rotationData) => {
  try {
    const res = await api.patch(`/designs/items/${itemId}/`, {
      rotation_y: rotationData.rotation_y,  // Float in radians
    });
    return res.data;
  } catch (err) {
    // Graceful fallback — if endpoint doesn't exist yet, log and continue
    if (err.response?.status === 404) {
      console.warn('PATCH endpoint not available yet — rotation saved locally only');
      return { status: 'local_only' };
    }
    throw new Error(
      err.response?.data?.error || err.message || 'Failed to save rotation'
    );
  }
};
// ─── Checkout & Inventory Sync ────────────────────────────────────
export const submitOrder = async (orderData) => {
  try {
    const res = await api.post('/checkout/', orderData);
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || 'Checkout failed');
  }
};

// ─── Stripe Payment ───────────────────────────────────────────────
export const createCheckoutSession = async (orderId) => {
  try {
    const res = await api.post('/create-checkout-session/', { order_id: orderId });
    return res.data; // { checkout_url: '...' }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || 'Failed to create checkout session');
  }
};

export default api;