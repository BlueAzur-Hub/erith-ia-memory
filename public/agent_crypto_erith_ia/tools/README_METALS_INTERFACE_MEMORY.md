# Mémoire Métaux inscrite dans l’Interface

Build 28.2.57R2.

- `data/metals/ryzen_report.json` contient le dernier rapport Ryzen validé.
- L’Interface le lit automatiquement sur le Ryzen et sur le Transformer Book.
- IndexedDB devient une copie locale de secours.
- L’ouverture et la lecture ne déclenchent aucune requête Metals.Dev.
- Un nouveau rapport validé remplace ce fichier lors de la prochaine livraison de l’Interface.
