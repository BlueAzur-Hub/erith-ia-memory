# Workspace Steward V3 — séparation canonique / utilisateur

Correction importante par rapport à V2 : **les sauvegardes manuelles de profils et de StrategySpecs ne sont plus désactivées**.

- `profiles/` et `strategy_specs/` restent la production canonique du rebuild Seven.
- `user_profiles/` et `user_strategy_specs/` reçoivent les créations manuelles lorsque le workspace est géré.
- `results/` et `comparisons/` restent canoniques ; les simulations manuelles sont calculées mais non persistées tant que le workspace est géré.
- Le rebuild préserve byte-for-byte les sources ainsi que les deux espaces utilisateur.

Cette séparation permet à Christophe ou Yoann de créer, sauvegarder et rejouer leurs propres configurations sans contaminer les preuves de référence.
