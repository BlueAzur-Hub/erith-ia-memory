const promptSeven = `Chat, active Aerith-7 Seven Heaven — Video Cards Boost.

Mode simple.
Texte uniquement par défaut.
Aucune génération image sans commande explicite.
Seven Heaven pilote.
Chargement minimal.
Choix précis.`;

const statusEl = document.getElementById("status");

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(promptSeven);
    statusEl.textContent = "Prompt copié.";
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = promptSeven;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    statusEl.textContent = "Prompt copié en mode secours.";
  }
}

document.getElementById("copyPrompt").addEventListener("click", copyPrompt);

document.getElementById("startSeven").addEventListener("click", async () => {
  await copyPrompt();
  window.open("https://chatgpt.com/", "seven_heaven_chatgpt");
});
