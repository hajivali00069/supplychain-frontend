async function loadSuppliers() {
  const listEl = document.getElementById("supplierList");
  try {
    const { suppliers } = await api.get("/suppliers");

    if (!suppliers || suppliers.length === 0) {
      listEl.innerHTML = `<p class="empty-state">No suppliers added yet.</p>`;
      return;
    }

    const rows = suppliers.map(s => `
      <tr>
        <td class="mono">${s.SupplierId}</td>
        <td>${s.SupplierName}</td>
        <td>${s.SupplierType}</td>
        <td>${s.Email}</td>
      </tr>
    `).join("");

    listEl.innerHTML = `
      <table>
        <thead><tr><th>Supplier ID</th><th>Name</th><th>Type</th><th>Email</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    listEl.innerHTML = `<div class="notice notice-error">Could not load suppliers: ${err.message}</div>`;
  }
}

document.getElementById("supplierForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const noticeEl = document.getElementById("formNotice");

  const payload = {
    supplierId: document.getElementById("supplierId").value.trim(),
    supplierName: document.getElementById("supplierName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    supplierType: document.getElementById("supplierType").value,
    address: document.getElementById("address").value.trim()
  };

  try {
    await api.post("/suppliers", payload);
    showNotice(noticeEl, "Supplier added successfully.", "success");
    e.target.reset();
    loadSuppliers();
  } catch (err) {
    showNotice(noticeEl, err.message, "error");
  }
});

loadSuppliers();
