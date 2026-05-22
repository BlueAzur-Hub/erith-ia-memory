const statusLine = document.getElementById("status");

const sevenPrompt = `Active Seven Portable Terminal.
Mode : interface privée.
Contexte : cité céleste, mémoire opérative, cockpit minimal.
Règles : sobriété, précision, pas de dérive, une action à la fois.`;

document.getElementById("copyPrompt").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(sevenPrompt);
    statusLine.textContent = "Prompt copié.";
  } catch {
    statusLine.textContent = sevenPrompt;
  }
});

document.getElementById("startSeven").addEventListener("click", () => {
  statusLine.textContent = "Seven démarrée.";
});
