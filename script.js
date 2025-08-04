let tableBody = document.querySelector("#invoiceTable tbody");
let subtotalEl = document.getElementById("subtotal");
let totalEl = document.getElementById("total");
let taxInput = document.getElementById("tax");
let taxAmountEl = document.getElementById("taxAmount");

function addRow(desc = "", qty = 1, price = 0) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" value="${desc}" class="desc" /></td>
    <td><input type="number" value="${qty}" class="qty" /></td>
    <td><input type="number" value="${price}" class="price" /></td>
    <td class="itemTotal">0.00</td>
    <td><button class="remove">🗑️</button></td>
  `;
  tableBody.appendChild(row);
  updateTotals();
  attachEvents();
}

function updateTotals() {
  let subtotal = 0;
  document.querySelectorAll("#invoiceTable tbody tr").forEach(row => {
    const qty = parseFloat(row.querySelector(".qty").value) || 0;
    const price = parseFloat(row.querySelector(".price").value) || 0;
    const total = qty * price;
    row.querySelector(".itemTotal").textContent = total.toFixed(2);
    subtotal += total;
  });
  subtotalEl.textContent = subtotal.toFixed(2);
  const taxRate = parseFloat(taxInput.value) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  taxAmountEl.textContent = taxAmount.toFixed(2);
  totalEl.textContent = (subtotal + taxAmount).toFixed(2);
}

function attachEvents() {
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", updateTotals);
  });
  document.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.target.closest("tr").remove();
      updateTotals();
    });
  });
}

function saveData() {
  const data = {
    from: document.getElementById("from").value,
    to: document.getElementById("to").value,
    tax: taxInput.value,
    items: [...document.querySelectorAll("#invoiceTable tbody tr")].map(row => ({
      desc: row.querySelector(".desc").value,
      qty: row.querySelector(".qty").value,
      price: row.querySelector(".price").value,
    }))
  };
  localStorage.setItem("invoiceData", JSON.stringify(data));
  alert("Saved locally! ✅");
}

function loadData() {
  const data = JSON.parse(localStorage.getItem("invoiceData"));
  if (!data) return;
  document.getElementById("from").value = data.from;
  document.getElementById("to").value = data.to;
  taxInput.value = data.tax;
  tableBody.innerHTML = "";
  data.items.forEach(item => addRow(item.desc, item.qty, item.price));
}

function downloadPDF() {
  import("jspdf").then(jsPDF => {
    const doc = new jsPDF.jsPDF();
    doc.text("Invoice", 20, 20);
    doc.text(`From: ${document.getElementById("from").value}`, 20, 30);
    doc.text(`To: ${document.getElementById("to").value}`, 20, 40);
    let y = 50;
    document.querySelectorAll("#invoiceTable tbody tr").forEach(row => {
      const desc = row.querySelector(".desc").value;
      const qty = row.querySelector(".qty").value;
      const price = row.querySelector(".price").value;
      const total = row.querySelector(".itemTotal").textContent;
      doc.text(`${desc} - Qty: ${qty}, Price: ${price}, Total: ${total}`, 20, y);
      y += 10;
    });
    doc.text(`Subtotal: ₹${subtotalEl.textContent}`, 20, y + 10);
    doc.text(`Tax: ₹${taxAmountEl.textContent}`, 20, y + 20);
    doc.text(`Total: ₹${totalEl.textContent}`, 20, y + 30);
    doc.save("invoice.pdf");
  });
}

document.getElementById("addRow").addEventListener("click", () => addRow());
document.getElementById("save").addEventListener("click", saveData);
document.getElementById("download").addEventListener("click", downloadPDF);
taxInput.addEventListener("input", updateTotals);

window.onload = () => {
  loadData();
  addRow();
};
