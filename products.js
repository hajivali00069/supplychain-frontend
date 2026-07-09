const STATUS_OPTIONS = ["Manufactured", "In Transit", "Delivered"];

async function loadProducts() {
  const listEl = document.getElementById("productList");
  try {
    const { products } = await api.get("/products");

    if (!products || products.length === 0) {
      listEl.innerHTML = `<p class="empty-state">No products registered yet.</p>`;
      return;
    }

    const rows = products.map(p => `
      <tr>
        <td class="mono"><a href="track.html?productId=${p.ProductId}">${p.ProductId}</a></td>
        <td>${p.ProductName}</td>
        <td>${p.SupplierId}</td>
        <td><span class="badge ${statusBadgeClass(p.Status)}">${p.Status}</span></td>
        <td>
          <select data-product-id="${p.ProductId}" class="statusSelect">
            ${STATUS_OPTIONS.map(s => `<option value="${s}" ${s === p.Status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
      </tr>
    `).join("");

    listEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Product ID</th><th>Name</th><th>Supplier</th><th>Status</th><th>Update</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    document.querySelectorAll(".statusSelect").forEach(select => {
      select.addEventListener("change", async (e) => {
        const productId = e.target.dataset.productId;
        const status = e.target.value;
        try {
          await api.put(`/products/${productId}`, { status });
          loadProducts();
        } catch (err) {
          alert(`Could not update status: ${err.message}`);
        }
      });
    });
  } catch (err) {
    listEl.innerHTML = `<div class="notice notice-error">Could not load products: ${err.message}</div>`;
  }
}

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const noticeEl = document.getElementById("formNotice");

  const payload = {
    productId: document.getElementById("productId").value.trim(),
    productName: document.getElementById("productName").value.trim(),
    batchNumber: document.getElementById("batchNumber").value.trim(),
    supplierId: document.getElementById("supplierId").value.trim(),
    manufacturingDate: document.getElementById("manufacturingDate").value,
    expiryDate: document.getElementById("expiryDate").value
  };

  try {
    await api.post("/products", payload);
    showNotice(noticeEl, "Product registered and first ledger entry written.", "success");
    e.target.reset();
    loadProducts();
  } catch (err) {
    showNotice(noticeEl, err.message, "error");
  }
});

loadProducts();
