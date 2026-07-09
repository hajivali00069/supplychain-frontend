// Thin fetch wrapper so every page handles errors the same way.

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: "PUT", body: JSON.stringify(body) })
};

function showNotice(container, message, type = "success") {
  container.innerHTML = `<div class="notice notice-${type}">${message}</div>`;
}

function statusBadgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("deliver")) return "badge-delivered";
  if (s.includes("transit")) return "badge-transit";
  if (s.includes("manufactur")) return "badge-manufactured";
  return "badge-transit";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
