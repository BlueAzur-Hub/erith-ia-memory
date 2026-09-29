# Agent-Crypto 40.6.473 — OKX T60 TRAJECTORY + UNKNOWN TRUTH

Terrain .472 :
- T+5 : 5 certifiés, 0 franchissement observé, 11 inconnus;
- T+15 : 3 certifiés, 0 franchissement observé, 13 inconnus;
- T+60 : 7 certifiés, 1 franchissement observé, 8 inconnus.
- cycle franchissant : A-CYCLE-00001-d562dc57, MFE partielle observée +0,691 % contre plancher +0,6109 %.

40.6.473 :
1. reconstruit la trajectoire durable jusqu'à T+60 pour chaque franchissement observé/certifié;
2. mesure premier passage observé, dernier échantillon au-dessus, pic et marge du pic;
3. compte les échantillons réellement au-dessus;
4. calcule un **span observé** entre premier et dernier échantillon au-dessus — ce n'est jamais une preuve de présence continue;
5. classe les 8 inconnus T+60 par PARTIAL_NO_CROSS / ARCHIVE_END_NO_SAMPLE / TARGET_GAP_NO_SAMPLE avec gaps avant/après cible lorsqu'ils existent.

Aucune interpolation. Aucun élargissement de tolérance. Aucun seuil/gate modifié. Slippage OKX toujours inconnu.
