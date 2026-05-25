SEVEN_PORTABLE_TERMINAL_REMOTE_FINAL_02

Version finale Remote Fix.

Changements :
- index.html : bouton RustDesk remplacé par un vrai lien natif href="rustdesk://".
- index.html : cache tags CSS/JS changés en 20260525-REMOTE-FINAL-02.
- script.js : handler RustDesk non bloquant, sans preventDefault, avec fallback window.location.href.
- style.css : classe remote-launch-btn ajoutée pour garder le style bouton.
- Aucun ID RustDesk, aucun mot de passe, aucune IP, aucun secret.

À uploader dans :
assets/SEVEN_PORTABLE_TERMINAL/

Test attendu :
Remote -> Ouvrir RustDesk doit déclencher directement le protocole rustdesk:// ou afficher la confirmation navigateur d’ouverture d’application externe.
