const TARGET_ID = "48 841 137";
const TARGET_ID_COMPACT = "48841137";
const RUSTDESK_CONNECT_URL = "rustdesk://connect/48841137";

const feedback = document.getElementById("feedback");
const copyBtn = document.getElementById("copyIdBtn");
const openBtn = document.getElementById("openRustDeskBtn");

if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(TARGET_ID);
      if (feedback) feedback.textContent = "ID Ryzen 7 copié : " + TARGET_ID;
    } catch (error) {
      if (feedback) feedback.textContent = "Copie impossible automatiquement. ID Ryzen 7 : " + TARGET_ID;
    }
  });
}

if (openBtn) {
  openBtn.setAttribute("href", RUSTDESK_CONNECT_URL);

  openBtn.addEventListener("click", (event) => {
    event.preventDefault();

    if (feedback) {
      feedback.textContent = "Ouverture RustDesk demandée : " + RUSTDESK_CONNECT_URL;
    }

    window.location.href = RUSTDESK_CONNECT_URL;
  });
}
