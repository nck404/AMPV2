const API_BASE = "/api";

export const STATIC_BASE = "";

const getToken = () => {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const handleUnauthorized = (response) => {
  if (response.status === 401) {
    const error = new Error("Unauthorized");
    error.status = 401;
    error.response = response;
    throw error;
  }
};

export const api = {
  async post(endpoint, data) {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) handleUnauthorized(response);
    return await response.json();
  },

  async get(endpoint) {
    const token = getToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!response.ok) handleUnauthorized(response);
    return await response.json();
  },

  async put(endpoint, data) {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) handleUnauthorized(response);
    return await response.json();
  },

  async upload(endpoint, formData) {
    const token = getToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!response.ok) handleUnauthorized(response);
    return await response.json();
  },

  async delete(endpoint) {
    const token = getToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) handleUnauthorized(response);
    return await response.json();
  },
};
