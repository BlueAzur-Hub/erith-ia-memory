# Handoff — 40.6.428

La correction repart de **40.6.425**.

Fonctionnellement, seul `style.css` change : hauteur native du `chart-shell` Crypto.

`59vh + 42px` → `61.5vh + 42px`  
min `507px` → `525px`  
max `647px` → `720px`

Aucun JS. Aucun resize runtime. Aucun changement Market Flow/Target Top/Aether/Market Core.

Test prioritaire : Target Top 5 doit être **entièrement visible** en bas, Market Flow **entièrement hors cadre**, en fenêtre normale et F11.
