# Trader R9 — suivi natif EUR/USD (2026-10-08)

Runtime reste 40.6.624, Market Core 38.15.11 protégé. Révision fonctionnelle du panneau R9 seulement.
EUR : masque les valeurs R9 USDT et affiche les points EUR du graphique natif (Binance ou CoinGecko) avec provenance et dates. Ne convertit aucun prix. L'affichage se rafraîchit sur l'événement quote-architecture-changed, avec au maximum deux contrôles différés bornés si le graphique natif charge encore.
USD : maintient la lecture Binance Spot R9 USDT SHA-256 et le fallback CoinGecko USD HORS R9 en cas d'actif non couvert. Les périodes EUR suivent le graphique natif, le menu de périodes du Coffre R9 restant propre au mode USD.
Pas de backend, bridge, Market Core, graphique, stockage, ordre, nouveau collecteur ou minuterie récurrente.
Tests : simulation EUR BTC natif, exclusion graphique USD périmé en EUR, maintien R9 BTC USD. Validation Firefox humaine à faire.
