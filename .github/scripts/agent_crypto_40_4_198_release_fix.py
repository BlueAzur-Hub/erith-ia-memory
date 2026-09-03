from pathlib import Path
import re

p = Path('.github/scripts/agent_crypto_40_4_198_release.py')
text = p.read_text(encoding='utf-8')
pattern = re.compile(r"old_loop_end = '''    \}\n  \}\);\n\n  const section = metals\.section;'''\nnew_loop_end = '''.*?a = replace_once\(a, old_loop_end, new_loop_end, 'Metals long button render state'\)\n", re.S)
replacement = r'''old_period_button_loop = '''  document.querySelectorAll("[data-metals-period]").forEach(button => {
    const value = Number(button.dataset.metalsPeriod);
    const active = atlasMetalsLongHistoryState404198.active === null && value === Number(metals.period);
    button.classList.toggle("is-active", active);
    const spotReading = value === 1
      ? atlasMetalsQuoteFoundationHorizonReading(atlasParallelMarketActiveMetal().id, 1)
      : null;
    button.classList.remove("is-unavailable");
    button.classList.toggle("is-building", value === 1 && spotReading?.available !== true);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    if (value === 1) {
      button.title = spotReading?.available
        ? "Historique 24 h réel · Yahoo Finance Futures intraday"
        : `Intraday Futures en attente · ${spotReading?.detail || "première collecte GitHub Actions requise"}`;
      button.setAttribute(
        "aria-label",
        spotReading?.available
          ? "24 heures mesurées par Yahoo Finance Futures intraday"
          : "Historique Futures intraday 24 heures en attente"
      );
    }
  });'''
new_period_button_loop = old_period_button_loop + '''

  document.querySelectorAll("[data-metals-long-period]").forEach(button => {
    const key = String(button.dataset.metalsLongPeriod || "");
    const active = key === atlasMetalsLongHistoryState404198.active;
    button.classList.toggle("is-active", active);
    button.classList.toggle("is-building", button.getAttribute("aria-busy") === "true");
    button.setAttribute("aria-pressed", active ? "true" : "false");
    button.title = active
      ? "FUTURE CONTINU · HISTORIQUE FOURNISSEUR · chargé à la demande"
      : "Historique long Yahoo Finance Futures chargé uniquement à l’appel";
  });'''
a = replace_once(a, old_period_button_loop, new_period_button_loop, 'Metals long button render state')
'''
new_text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise RuntimeError(f'failed to fix release anchor: {count}')
p.write_text(new_text, encoding='utf-8')
print('release patch anchor fixed')
