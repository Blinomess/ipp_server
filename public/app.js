const API_URL = "/v1/contact";

const contactsList = document.getElementById("contactsList");
const errorEl = document.getElementById("error");
const reloadBtn = document.getElementById("reloadBtn");

function showError(message) {
  errorEl.textContent = message || "";
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function loadContacts() {
  showError("");
  contactsList.innerHTML = "";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const contacts = await response.json();

    if (!contacts.length) {
      const li = document.createElement("li");
      li.textContent = "Контактов пока нет";
      contactsList.appendChild(li);
      return;
    }

    contacts.forEach((contact) => {
      const mobile = (contact.telephone && contact.telephone.mobile) || "—";
      const home = (contact.telephone && contact.telephone.home) || "—";

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${escapeHtml(contact.username)}</strong> —
        ${escapeHtml(contact.email)} —
        моб.: ${escapeHtml(mobile)} —
        дом.: ${escapeHtml(home)}
      `;
      contactsList.appendChild(li);
    });
  } catch (err) {
    showError("Не удалось загрузить контакты: " + err.message);
  }
}

reloadBtn.addEventListener("click", loadContacts);

loadContacts();