const TARGET_ID = "48 841 137";
const TARGET_ID_COMPACT = "48841137";

const feedback = document.getElementById("feedback");
const copyBtn = document.getElementById("copyIdBtn");
const openBtn = document.getElementById("openRustDeskBtn");

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(TARGET_ID);
    feedback.textContent = "ID Ryzen 7 copié : " + TARGET_ID;
  } catch (error) {
    feedback.textContent = "Copie impossible automatiquement. ID Ryzen 7 : " + TARGET_ID;
  }
});

openBtn.addEventListener("click", () => {
  feedback.textContent = "Ouverture RustDesk demandée. Si rien ne se passe, copie l’ID puis colle-le dans RustDesk : " + TARGET_ID;
});
