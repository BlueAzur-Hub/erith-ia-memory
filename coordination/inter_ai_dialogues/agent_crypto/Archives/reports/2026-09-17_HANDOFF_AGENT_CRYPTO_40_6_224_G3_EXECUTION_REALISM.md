# HANDOFF — Agent-Crypto @erith.IA — 40.6.224

Date: 2026-09-17
Canonical repo: `BlueAzur-Hub/erith-ia-memory`
Administrator: `public/agent_crypto_erith_ia/administrator/`
Latest build: **40.6.224**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
Gate 3: **PENDING**
Gate 9: **LOCKED**

## 1. Operator contract

Christophe is the Firefox terrain operator. Do not ask him to find JavaScript function names, internal APIs, hidden DOM ids or code-only controls.

Acceptable operator actions are ordinary visible UI actions only: reload, click a visibly verified control, export the markdown report, provide screenshots, describe visual problems.

The AI owns code inspection, root-cause analysis, minimal surgery, GitHub publishing, static verification, commit receipts and blocker selection.

## 2. Protected invariants

- Market Core `38.15.11` is protected.
- Strategy A remains PAPER ONLY.
- No real order, wallet, exchange write path or live unlock.
- Gate 9 remains LOCKED.
- No historical backfill.
- Never apply the current Oracle to past decisions.
- Never use future outcomes as T0 inputs.
- Never convert UNKNOWN execution facts to zero.
- Do not promote Gate 3 from presentation code or from partial evidence.
- A realistic G3 replay eventually requires fees, spread, slippage, latency, liquidity and partial-fill realism.

## 3. Terrain proven through 40.6.222

Firefox exports from Build 40.6.222 prove:

- G2 COHÉRENCE LOGIQUE = `FOUNDATION_PASS`.
- G7 CHAOS TESTING = `FOUNDATION_PASS`.
- G3 24h temporal contract = CERTIFIED.
- Market rows = 300.
- Certified T0 decisions = 2.
- Joined replay decisions = 2.
- Replay dataset = `READY_FOR_DECISION_REPLAY`.
- Post-T0 T+5 / T+15 / T+60 outcomes = **6 / 6 certified** across the two joined decisions.
- Outcome labels = `CERTIFIED` in the canonical 40.6.222 receipt.
- Gate 3 remains `PENDING`.
- Gate 9 remains `LOCKED`.

This closes the **market-data + T0 + post-T0 outcome** sub-layer of Gate 3. Do not reopen it unless new terrain evidence disproves it.

## 4. 40.6.223 — realistic replay readiness truth

Owner:
`public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-realistic-replay-readiness-406223.js`

Purpose: separate two layers:

1. market/outcome evidence — replay dataset + certified post-T0 labels;
2. execution realism — after-cost evidence, cost completeness, partial fills, latency and liquidity.

It is read-only and does not run a backtest.

Canonical commits:
- owner: `5f87f456534487a6faca51a563ea52581abab177`
- index wiring: `f7f4b5a8bbaf8b555866b498628172f700748639`
- build manifest: `39a2092c4ae902798ffc9aeea4f5736a3fb9b920`
- release receipt: `d5420d58a0b07d97eb0d50ab17d2672813b0ad85`

## 5. 40.6.224 — forward evidence bridge

Owner:
`public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-forward-evidence-bridge-406224.js`

Purpose: repair stale legacy Gate-3 wording in `strategyAEvidenceGateAudit` without mutating the certification matrix.

The visible Gate-3 row should now say, in substance:
- replay market ready;
- post-T0 results certified 6/6;
- next blockers are execution-realism blockers.

Gate 3 must stay WAIT/PENDING.

Canonical commits:
- owner: `b11a4f3a61f065a352a616e03cb41b5a1ad3d83f`
- index wiring: `8f851bb26c2ce3550a5051fe49cfb39b072dfbd0`
- build manifest: `b657f26be4656ef9236a854541652e44448e68e4`
- release receipt: `0e50917f80a53e0fef9690df5724351c68a9fefd`

Current canonical content SHAs after 40.6.224:
- `administrator/index.html`: `49ef10247fa8f4c8ae95ed9b75c0c47fb74ebee8`
- `administrator/build.json`: `46ca8a6caccf2afee663a368e8bbe2d3816e4b53`

## 6. Exact next blocker

Do not build another outcome/T0 owner. That part is complete.

The next Gate-3 blocker is **execution realism**.

Current terrain/source evidence indicates:

- Strategy A After-Cost Metrics exists, but the current Strategy-A evidence dossier has **0 certifiable after-cost rows / 0 complete Strategy-A PAPER trades**.
- The existing After-Cost owner can account for fees / impact / spread / slippage when lifecycle reconciliation facts exist, but missing facts remain UNKNOWN.
- The PAPER lifecycle engine supports submitted / acknowledged / partial / filled / reconcile / timeout / cancel states, so partial-fill mechanics exist at the lifecycle layer.
- No canonical Gate-3 owner has yet proved historical **latency realism**.
- No canonical Gate-3 owner has yet proved historical **liquidity realism**.
- Therefore no realistic economic backtest may be certified yet.

## 7. Next safe work order

1. Inspect the repo for an existing owner of execution latency, order-book depth/liquidity, spread/slippage or execution simulation before creating a new owner. Prefer bridging existing truth over duplicating owners.
2. If such truth exists, create a read-only execution-realism bridge and prove exact fields / timestamps / version binding.
3. If it does not exist, define a PAPER-only execution-realism evidence contract. UNKNOWN must remain UNKNOWN; do not invent fixed latency or liquidity values merely to pass Gate 3.
4. Let real Strategy-A PAPER evidence accumulate naturally. Never force trades for sample count.
5. Only once cost, latency, liquidity and partial-fill realism are proven may a dedicated realistic replay/backtest owner execute and certify historical replay.
6. Gate 3 PASS must require the realistic backtest owner, not a presentation bridge.
7. Move to G4 Out-of-Sample only after G3 is genuinely certified.

## 8. Remaining gates after the proven G2/G7 work

- G1 Data Quality: still not fully certified in the Strategy-A Evidence Dossier; after-cost dataset integrity/sample remains a debt.
- G2 Logic: `FOUNDATION_PASS` proven.
- G3 Realistic Backtest: current active chantier; data/outcome sub-layer complete, execution-realism sub-layer incomplete.
- G4 OOS: pending; do not start tuning against its holdout before G3 is certified.
- G5 Walk Forward: pending.
- G6 Monte Carlo / Stress: pending; existing owner expects sufficient complete after-cost PAPER rows before stress work.
- G7 Chaos/Foundation: `FOUNDATION_PASS` proven.
- G8 Paper Trading: insufficient sample; continue naturally, do not force trades.
- G9 Micro-live: LOCKED.

## 9. UX debt

Administrator remains dense and technical. Keep operator-facing summaries in plain French and collapse technical detail where possible, but do not let cosmetic work interrupt the Gate-3 blocker chain.

Known visual work already done:
- canonical header restored after the 40.6.216 regression;
- Aerith-10 Créatrice hero framing changed to preserve the full visual;
- old Gate-3 wording is bridged forward in 40.6.224.

## 10. Immediate terrain request

When Christophe is available, ask only:

> Recharge jusqu’à **Build 40.6.224**, puis exporte le `.md` et, si utile, une capture de la zone Gate 3. Rien d’autre à cliquer.

From that terrain proof, determine whether 40.6.223/224 mounted correctly and expose the exact execution-realism blocker. Do not invent 40.6.225 before reading that proof unless static source inspection reveals a direct, independent defect.

---

## Prompt de reprise pour la sœur IA

Tu reprends **Agent-Crypto @erith.IA** au Build canonique **40.6.224** dans `BlueAzur-Hub/erith-ia-memory/public/agent_crypto_erith_ia/administrator/`.

Commence par relire ce handoff, `build.json`, `index.html`, les owners `.222/.223/.224`, puis les sources After-Cost Metrics, PAPER Lifecycle et Evidence Gate Audit. Protège Market Core **38.15.11**. Strategy A reste **PAPER ONLY**, G3 **PENDING**, G9 **LOCKED**.

Faits terrain déjà acquis : G2 et G7 sont `FOUNDATION_PASS`; G3 a 24h certifiées, 2 T0 certifiés, 2 jointures, replay prêt, et les résultats post-T0 T+5/T+15/T+60 sont **6/6 CERTIFIED**. Ne rouvre pas cette couche sans preuve contraire.

Le chantier actif est maintenant **G3 execution realism** : prouver after-cost réel Strategy A, modèle de coûts complet, partial fills, latence et liquidité sans inventer de valeurs. Cherche d’abord des owners existants et réutilise-les. UNKNOWN reste UNKNOWN. Aucun backfill, aucun Oracle courant appliqué au passé, aucun futur en entrée T0, aucun ordre réel, aucune promotion artificielle de Gate.

Christophe est opérateur Firefox : ne lui demande jamais des noms de fonctions JS, IDs DOM ou APIs internes. Ses actions doivent rester reload, contrôle visuel, bouton réellement visible, export `.md`, capture écran. Toute chirurgie code/GitHub et tout diagnostic propriétaire sont à ta charge.

Méthode : lire la zone complète avant chirurgie → correction minimale anti-destruction → vérification statique → publication + commits → preuve terrain → arrêt. Si le terrain 40.6.224 est disponible, lis-le avant toute 40.6.225.
