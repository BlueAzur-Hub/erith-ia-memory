from pathlib import Path
import re

p = Path('.github/scripts/agent_crypto_40_4_198_release.py')
text = p.read_text(encoding='utf-8')
pattern = re.compile(
    r"old_loop_end = '''    \}\n  \}\);\n\n  const section = metals\.section;'''\nnew_loop_end = '''.*?a = replace_once\(a, old_loop_end, new_loop_end, 'Metals long button render state'\)\n",
    re.S,
)
replacement = r"""marker = '  document.querySelectorAll(\"[data-metals-period]\").forEach(button => {'
start = a.find(marker)
if start < 0:
    raise RuntimeError('Metals period render loop marker missing')
end = a.find('\n  });', start)
if end < 0:
    raise RuntimeError('Metals period render loop end missing')
end += len('\n  });')
insert_long_buttons = r'''

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
a = a[:end] + insert_long_buttons + a[end:]
"""
new_text, count = pattern.subn(lambda _match: replacement, text, count=1)
if count != 1:
    raise RuntimeError(f'failed to fix release anchor: {count}')
p.write_text(new_text, encoding='utf-8')
print('release patch anchor fixed with literal escapes')
