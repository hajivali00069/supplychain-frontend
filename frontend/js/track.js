function currentProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("productId") || document.getElementById("lookupProductId").value.trim();
}

async function loadShipmentHistory(productId) {
  const historyEl = document.getElementById("shipmentHistory");

  if (!productId) {
    historyEl.innerHTML = `<p class="empty-state">Enter a product ID above to load its journey.</p>`;
    return;
  }

  try {
    const { events } = await api.get(`/shipments/${productId}`);

    if (!events || events.length === 0) {
      historyEl.innerHTML = `<p class="empty-state">No checkpoints logged yet for ${productId}.</p>`;
      return;
    }

    const items = events.map(ev => `
      <li>
        <div class="event-type">${ev.Status} ${ev.Location ? `— ${ev.Location}` : ""}</div>
        <div class="event-meta">
          ${formatDateTime(ev.RecordedAt)}
          ${ev.Temperature !== null && ev.Temperature !== undefined ? `· ${ev.Temperature}°C` : ""}
          ${ev.Latitude && ev.Longitude ? `· ${ev.Latitude}, ${ev.Longitude}` : ""}
        </div>
      </li>
    `).join("");

    historyEl.innerHTML = `<ul class="chain">${items}</ul>`;
  } catch (err) {
    historyEl.innerHTML = `<div class="notice notice-error">Could not load history: ${err.message}</div>`;
  }
}

document.getElementById("lookupBtn").addEventListener("click", () => {
  loadShipmentHistory(document.getElementById("lookupProductId").value.trim());
});

document.getElementById("shipmentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const noticeEl = document.getElementById("formNotice");
  const productId = currentProductId();

  if (!productId) {
    showNotice(noticeEl, "Enter a product ID in the box above first.", "error");
    return;
  }

  const payload = {
    productId,
    location: document.getElementById("location").value.trim(),
    latitude: document.getElementById("latitude").value || null,
    longitude: document.getElementById("longitude").value || null,
    temperature: document.getElementById("temperature").value || null,
    status: document.getElementById("status").value
  };

  try {
    await api.post("/shipments", payload);
    showNotice(noticeEl, "Checkpoint logged.", "success");
    e.target.reset();
    loadShipmentHistory(productId);
  } catch (err) {
    showNotice(noticeEl, err.message, "error");
  }
});

// If a productId was passed in the URL (e.g. from products.html), prefill and load
const prefill = new URLSearchParams(window.location.search).get("productId");
if (prefill) {
  document.getElementById("lookupProductId").value = prefill;
  loadShipmentHistory(prefill);
}
