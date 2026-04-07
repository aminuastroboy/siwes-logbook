const BASE_URL = "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("siwes_token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export const api = {
  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  login(payload) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  me() {
    return request("/me");
  },
  getLogs() {
    return request("/logs");
  },
  createLog(payload) {
    return request("/logs", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateLog(id, payload) {
    return request(`/logs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  deleteLog(id) {
    return request(`/logs/${id}`, {
      method: "DELETE"
    });
  },
  getSupervisorQueue() {
    return request("/supervisor/queue");
  },
  reviewLog(id, payload) {
    return request(`/supervisor/logs/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  getAdminStudents() {
    return request("/admin/students");
  },
  getAdminSummary() {
    return request("/admin/summary");
  }
};

export function saveAuth(token, user) {
  localStorage.setItem("siwes_token", token);
  localStorage.setItem("siwes_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("siwes_token");
  localStorage.removeItem("siwes_user");
}

export function getStoredUser() {
  const raw = localStorage.getItem("siwes_user");
  return raw ? JSON.parse(raw) : null;
}
