#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
root = Path(__file__).resolve().parent
index = (root / "index.html").read_text(encoding="utf-8")
app = (root / "app.js").read_text(encoding="utf-8")
data = (root / "forge-data.js").read_text(encoding="utf-8")
registry = (root / "flower-girls-registry.js").read_text(encoding="utf-8")
g = json.loads((root / "GOLDEN_MASTER_HOME.json").read_text(encoding="utf-8"))
errors = []
for text in g["required_home_strings"]:
    if text not in index: errors.append(f"Accueil manquant: {text}")
for text in g["forbidden_home_strings"]:
    if text in index: errors.append(f"Accueil interdit présent: {text}")
if 'find(item => item.id === "creator")' not in app:
    errors.append("Aerith-10 Créatrice n'est plus le profil par défaut")
for text in [g["routeuse"]["profile_status"], g["routeuse"]["persona_status"], g["routeuse"]["core"], g["routeuse"]["persona"]]:
    if text not in registry: errors.append(f"Routeuse incohérente: {text}")
if "function isExistingFlowerGirl()" not in app:
    errors.append("Protection anti-recréation des Flower Girls existantes absente")
if errors:
    print("ÉCHEC")
    for e in errors: print("-", e)
    sys.exit(1)
print("OK — Accueil verrouillé, Créatrice par défaut, Routeuse reconnue comme profil existant.")
