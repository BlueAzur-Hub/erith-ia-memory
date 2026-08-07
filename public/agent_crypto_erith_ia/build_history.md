# Agent-Crypto — historique des builds

> Historique humain extrait du manifeste `version.json` lors du Build 28.3.18.
> Ce fichier est documentaire : le runtime ne le lit pas.

## Build 28.3.21 — Two-File Version Control Final Lock

- Base : Build 28.3.20 validé sous Firefox.
- Mission : terminer la séparation du versionnage et supprimer définitivement l’identité Build/token de `index.html` et `style.css`.
- Versionnage actif : `web/app.js` + `web/version.json`.
- `index.html` ne contient plus de meta Build/token et charge `style.css` / `app.js` par leurs URLs canoniques sans paramètre de Build.
- `style.css` ne contient plus de marqueur Build/token ni de variables CSS de version.
- Les libellés de version visibles dans l’interface sont injectés au runtime par `app.js`.
- `version.json` conserve les empreintes SHA-256 des ressources publiées : elles servent à l’intégrité de publication, pas à leur donner une identité de version.
- `runtime_config.json` reste strictement inchangé.
- Nouvelle fonctionnalité produit : aucune.
- À partir de cette Build, si HTML/CSS/configuration ne changent pas, une future Build de versionnage n’a plus besoin de les modifier ni de les réuploader.

---

## Build 28.3.20 — Two-File Version Control Transition Lock

- Base : Build 28.3.19 validé sous Firefox.
- Mission : installer le nouveau noyau de versionnage centré sur `app.js` + `version.json`.
- `version.json` abandonne `coherence_contract` et devient le manifeste d’identité + intégrité SHA-256.
- `app.js` vérifie désormais l’identité distante par ses propres constantes Build/token et contrôle les empreintes des fichiers publiés.
- `index.html` et `style.css` conservent leurs marqueurs Build/token **une dernière fois**, uniquement pour que le contrôleur 28.3.19 puisse accepter et installer cette Build.
- Le nouveau contrôleur 28.3.20 n’utilise plus ces marqueurs HTML/CSS.
- Avant rechargement, les ressources publiées sont relues avec `cache: reload` et leur SHA-256 est contrôlé afin de rafraîchir le cache HTTP sans dépendre d’un numéro de Build dans le CSS ou le HTML.
- `runtime_config.json` reste strictement inchangé.
- Nouvelle fonctionnalité produit : aucune.
- Prochaine étape : suppression définitive des marqueurs Build/token de `index.html` et `style.css` dans la Build suivante, une fois cette transition validée sous Firefox.

---

## Build 28.3.19 — Runtime Config Separation Lock

- Base : Build 28.3.18.
- Mission : sortir la configuration runtime de `version.json`.
- Nouvelle fonction produit : aucune.
- Comportement volontairement modifié : aucun.
- `assets` et `registries` sont déplacés sans modification vers `web/runtime_config.json`.
- `version.json` conserve uniquement l’identité de publication et le contrat de cohérence encore requis par le contrôleur actuel.
- `runtime_config.json` ne porte aucun numéro de Build : il ne change que lorsque la configuration change.

## Build 28.3.18 — Version Manifest Separation Lock

- Base : Build 28.3.17.
- Mission : sortir les strates historiques de `version.json`.
- Nouvelle fonction produit : aucune.
- Comportement volontairement modifié : aucun.
- `version.json` reste le manifeste actif.
- `build_history.md` devient l’archive humaine des métadonnées historiques retirées.

## Build 28.3.17 — Human Code Architecture Foundation Lock

- Restructuration humaine de `index.html`, `style.css` et `app.js`.
- Ordre du code aligné sur l’ordre visuel de l’interface.
- Blocs numérotés et recherchables par `Ctrl+F`.
- Refactoring à comportement constant.

---

## Archive héritée de `version.json` 28.3.17

Les sections suivantes sont conservées sans perte de données. Chaque objet JSON ci-dessous reprend exactement la valeur retirée du manifeste 28.3.17.

### Fondations, géométrie et publication

#### `merge_base`

```json
{
  "product_and_metals_workspace": "28.2.44",
  "update_control": "28.2.47",
  "excluded_visual_layers": [
    "28.2.45",
    "28.2.46",
    "28.2.47"
  ]
}
```

#### `geometry_repair`

```json
{
  "base": "28.2.48",
  "scope": "metals_wide_deck_css_only",
  "wide_breakpoint_min_px": 1101,
  "stacked_breakpoint_max_px": 1100,
  "firefox_reported_dead_column_removed": true,
  "update_control_unchanged": true,
  "registries_unchanged": true
}
```

#### `publication_identity_single_source_lock`

```json
{
  "base": "28.2.75",
  "scope": "version_detection_and_update_path_only",
  "style_active_identity_at_file_start": true,
  "legacy_style_markers_neutralized": true,
  "runtime_css_identity_matches_manifest": true,
  "old_28_2_75_parser_can_detect_28_2_76": true,
  "market_logic_unchanged": true,
  "geometry_unchanged": true,
  "state": "validated_on_firefox_ryzen"
}
```

#### `publication_identity_immutability_cache_recovery_lock`

```json
{
  "build": "28.3.14",
  "base": "28.3.13",
  "cause": "same_build_republication_reused_asset_token_after_app_and_index_changed",
  "scope": [
    "unique_build_identity",
    "unique_asset_token",
    "four_asset_identity_alignment",
    "same_build_token_change_detection",
    "cache_recovery"
  ],
  "same_build_republication_forbidden": true,
  "previous_same_build_hotfix_invalidated": true,
  "active_assets": [
    "index.html",
    "app.js",
    "style.css",
    "version.json"
  ],
  "remote_update_requires_newer_build_or_changed_token": true,
  "pedagogy_schema_changed": false,
  "persistence_schema_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "simulation_engine_changed": false,
  "firefox_existing_profile_validation_required": true
}
```

#### `historical_version_control_restoration_lock`

```json
{
  "build": "28.3.16",
  "base": "28.3.14",
  "historical_controller_reference": [
    "28.3.12",
    "28.3.13"
  ],
  "scope": "version_control_only",
  "removed_28_3_14_same_build_token_update_path": true,
  "remote_update_requires_strictly_newer_build": true,
  "same_build_runtime_repair_preserved": true,
  "same_build_republication_forbidden": true,
  "active_assets": [
    "index.html",
    "app.js",
    "style.css",
    "version.json"
  ],
  "pedagogy_changed": false,
  "persistence_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "simulation_changed": false,
  "layout_changed": false,
  "firefox_existing_profile_validation_required": true
}
```

### Métaux

#### `public_metals_structural_layer`

```json
{
  "schema": "agent_crypto_metals_structural_registry_v1",
  "version": "1.0.0",
  "path": "metals_structural_registry.json",
  "assets": 5,
  "reference_year": 2025,
  "primary_source": "USGS Mineral Commodity Summaries 2026 v1.3",
  "quotes_connected": false,
  "historical_prices_imported": false
}
```

#### `metals_market_frame_cleanup`

```json
{
  "base": "28.2.52",
  "scope": "remove_unrequested_market_header_button_only",
  "global_market_shortcut_preserved": true,
  "market_frame_preserved": [
    "TARGET MÉTAUX",
    "METALS FLOW",
    "ESPACE 02 · MARKET MÉTAUX"
  ],
  "removed_element_id": "atlasMetalsReturnToGraph",
  "crypto_workspace_unchanged": true,
  "metals_data_unchanged": true,
  "quotes_connected": false
}
```

#### `metals_data_foundation`

```json
{
  "base": "28.2.57R3",
  "schema": "agent_crypto_metals_snapshot_v1",
  "contract": "metals_quote_adapter_contract.json",
  "snapshot_path": "../data/metals/latest.json",
  "status_path": "../data/metals/status.json",
  "history_index_path": "../data/metals/history/index.json",
  "archive_reader_ready": true,
  "archive_assets": 5,
  "provider_configured": true,
  "bridge_required": false,
  "crypto_data_reuse_forbidden": true,
  "quotes_connected": true,
  "chart_series_connected": true,
  "layout_unchanged": true,
  "crypto_workspace_unchanged": true,
  "public_archive_primary": true,
  "history_sessions_per_asset": 261,
  "state": "ready"
}
```

#### `metals_snapshot_import_gate`

```json
{
  "base": "28.2.54",
  "state": "ready",
  "input_schema": "agent_crypto_metals_import_v1",
  "tool": "../tools/metals_snapshot_ingest.py",
  "template": "../data/metals/import_template.json",
  "provider_configured": true,
  "provider_fetch_performed": false,
  "public_key_exposure": false,
  "full_basket_required_by_default": true,
  "history_writer_ready": true,
  "market_reader_ready": true,
  "chart_requires_two_or_more_real_snapshots": true,
  "layout_unchanged": true,
  "crypto_workspace_unchanged": true,
  "normal_flow": false
}
```

#### `metals_live_bridge`

```json
{
  "base": "28.2.55",
  "bridge_origin": "http://127.0.0.1:8787",
  "bridge_version_required": null,
  "snapshot_route": "/market/metals/snapshot",
  "status_route": "/market/metals/status",
  "history_route": "/market/metals/history",
  "manual_refresh_only": false,
  "provider_requests_per_manual_refresh": 0,
  "github_pages_remains_primary_interface": true,
  "local_interface_copy_is_fallback_only": false,
  "layout_unchanged": true,
  "crypto_workspace_unchanged": true,
  "state": "retired_public_archive_only",
  "public_archive_primary": true,
  "metals_dev_reactivation_forbidden": true
}
```

#### `metals_comparative_history`

```json
{
  "base": "28.2.57R3",
  "mode": "public_futures_daily_one_year",
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "value_delta": true,
  "percent_delta": true,
  "trend_state": [
    "up",
    "down",
    "stable",
    "insufficient",
    "incoherent"
  ],
  "snapshot_strip": true,
  "provider_requests_for_comparison": 0,
  "predictions_generated": false,
  "book_transfer_controls_visible": false,
  "crypto_workspace_unchanged": true,
  "spot_current_series_separated": true
}
```

#### `public_metals_archive`

```json
{
  "base": "28.2.57R3",
  "collector": "../tools/collect_public_metals.py",
  "workflow": ".github/workflows/atlas-public-metals-archive.yml",
  "current_source": "Gold API (indicative)",
  "history_source": "Yahoo Finance futures (daily 1y)",
  "fx_source": "BCE reference rate",
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "history_range": "1y daily",
  "api_key_required": false,
  "manual_ryzen_publication_required": false,
  "bridge_required_for_book": false,
  "crypto_workspace_unchanged": true,
  "legacy_metals_dev_active": false,
  "bridge_role": "optional local cache after public archive validation",
  "state": "ready",
  "schedule": "every_4_hours",
  "failure_policy": "preserve_last_valid_and_mark_degraded",
  "report_generation": "browser_from_public_archive",
  "report_persistence": "indexeddb_v2",
  "same_public_files_ryzen_and_transformer_book": true,
  "first_real_github_run_completed": true,
  "current_quotes_ready": true,
  "history_ready": true,
  "archive_assets": 5
}
```

#### `metals_public_archive`

```json
{
  "current_history_decoupled": true,
  "history_failure_blocks_current_quotes": false,
  "multi_horizon_history_connected": true,
  "twenty_four_hour_intraday_fabrication_forbidden": true
}
```

#### `metals_multi_horizon_history`

```json
{
  "base": "28.2.59",
  "state": "connected",
  "current_quote_source": "Gold API indicative spot reference",
  "history_source": "Yahoo Finance continuous Futures daily public archive",
  "fx_source": "ECB daily reference rate",
  "chart_periods_connected_days": [
    7,
    30,
    90,
    365
  ],
  "analysis_horizons_connected_days": [
    7,
    30,
    90,
    365
  ],
  "twenty_four_hour_policy": "intraday_required_no_daily_two_point_curve",
  "spot_futures_mixing_forbidden": true,
  "anchor_before_period_cutoff_used": true,
  "base100_multi_asset_only": true,
  "raw_price_single_active_asset_only": true,
  "crypto_workspace_unchanged": true,
  "layout_geometry_unchanged": true,
  "bridge_role_unchanged": "legacy_optional_fallback"
}
```

#### `metals_results_visibility`

```json
{
  "base": "28.2.60",
  "state": "ready",
  "default_period_days": 7,
  "saved_24h_state_migrated_once": true,
  "primary_analysis_horizons_days": [
    7,
    30,
    90,
    365
  ],
  "result_headline_visible": true,
  "result_headline_fields": [
    "asset",
    "symbol",
    "period",
    "percent",
    "sessions",
    "date_range",
    "current_quote_separation"
  ],
  "twenty_four_hour_state": "explicit_intraday_unavailable",
  "report_history_label": "sessions_futures",
  "indexeddb_report_refreshed_from_newer_public_snapshot": true,
  "crypto_workspace_unchanged": true,
  "collector_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_terminology_responsive_results`

```json
{
  "base": "28.2.61",
  "state": "ready",
  "analysis_horizons_responsive": true,
  "one_year_result_clipping_fixed": true,
  "comparison_label": "two_latest_futures_sessions",
  "history_counter_label": "futures_sessions",
  "provider_change_null_policy": "display_not_provided_never_zero",
  "provider_change_spot_futures_separation_preserved": true,
  "crypto_workspace_unchanged": true,
  "collector_unchanged": true,
  "github_actions_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_parallel_math_core_graph_recovery`

```json
{
  "base": "28.2.62",
  "state": "ready",
  "result_headline_mode": "compact_explicit_grid_row",
  "graph_height_recovered": true,
  "math_core_metals_version": "1.0.0",
  "math_core_follows_active_metal": true,
  "math_core_follows_active_period": true,
  "math_core_metrics": [
    "real_sessions",
    "period_variation_pct",
    "session_volatility_pct",
    "max_drawdown_pct",
    "high_low_amplitude_pct",
    "series_completeness_pct"
  ],
  "current_quote_source": "Gold API indicative",
  "historical_source": "Yahoo Finance Futures daily",
  "spot_futures_separated": true,
  "math_core_crypto_restored_on_crypto_domain": true,
  "market_metals_reused_not_duplicated": true,
  "display_order": [
    "metals_graph",
    "metals_math_core",
    "existing_metals_market",
    "metals_analysis"
  ],
  "prediction_generated": false,
  "crypto_workspace_unchanged": true,
  "collector_unchanged": true,
  "github_actions_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_result_footer_placement`

```json
{
  "base": "28.2.63",
  "state": "ready",
  "result_position": "below_chart_stage",
  "reading_order": [
    "graph_header",
    "futures_chart",
    "compact_result_footer",
    "graph_selection_footer"
  ],
  "result_ids_unchanged": true,
  "result_calculation_unchanged": true,
  "graph_calculation_unchanged": true,
  "math_core_metals_unchanged": true,
  "math_core_crypto_unchanged": true,
  "market_metals_unchanged": true,
  "metals_analysis_unchanged": true,
  "collector_unchanged": true,
  "github_actions_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_unified_reading`

```json
{
  "base": "28.2.64",
  "state": "ready",
  "surface": "metals_detail_panel",
  "active_metal_synchronized": true,
  "active_period_synchronized": true,
  "horizons_summarized": [
    7,
    30,
    90,
    365
  ],
  "language": "plain_french_descriptive",
  "prediction_generated": false,
  "recommendation_generated": false,
  "spot_and_futures_separated": true,
  "graph_unchanged": true,
  "math_core_metals_unchanged": true,
  "market_metals_unchanged": true,
  "crypto_workspace_unchanged": true,
  "collector_unchanged": true,
  "github_actions_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_real_24h_spot_archive`

```json
{
  "base": "28.2.65",
  "state": "secondary_collection_journal",
  "collector": "../tools/collect_public_metals.py",
  "workflow": ".github/workflows/atlas-public-metals-archive.yml",
  "file": "../data/metals/history/spot_48h.json",
  "source": "Gold API",
  "schedule": "every_4_hours",
  "retention_hours": 48,
  "minimum_complete_hours": 20,
  "complete_five_asset_baskets_only": true,
  "first_real_point_after_first_workflow_run": true,
  "full_window_requires_elapsed_time": true,
  "futures_horizons_preserved": [
    7,
    30,
    90,
    365
  ],
  "spot_and_futures_separated": true,
  "fabricated_points_forbidden": true,
  "crypto_workspace_unchanged": true,
  "bridge_unchanged": true,
  "primary_chart_source": false
}
```

#### `metals_immediate_24h_futures`

```json
{
  "base": "28.2.66",
  "state": "ready_after_first_github_actions_run",
  "file": "../data/metals/history/intraday_24h.json",
  "source": "Yahoo Finance continuous Futures intraday",
  "interval": "5m",
  "requested_range": "2d",
  "display_window_hours": 24,
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "full_series_fetched_each_run": true,
  "rolling_accumulation_wait_removed": true,
  "gold_api_role": "current indicative quote only",
  "spot_and_intraday_futures_separated": true,
  "daily_futures_horizons_preserved": [
    7,
    30,
    90,
    365
  ],
  "fabricated_points_forbidden": true,
  "crypto_workspace_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_all_series_comparison`

```json
{
  "base": "28.2.67",
  "state": "ready",
  "control": "TOUS",
  "location": "compact_metals_chart_legend_after_HG",
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "periods_days": [
    1,
    7,
    30,
    90,
    365
  ],
  "automatic_view": "base100",
  "single_asset_return_view": "real_price",
  "legend_variations_visible": true,
  "leader_and_laggard_visible": true,
  "spread_points_visible": true,
  "artificial_average_generated": false,
  "gold_api_current_quotes_mixed_with_futures": false,
  "math_core_changed": false,
  "crypto_workspace_unchanged": true,
  "collectors_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_cursor_historical_inspector`

```json
{
  "base": "28.2.69",
  "state": "ready",
  "title": "PRIX HISTORIQUE",
  "pointer_following_panel": true,
  "nearest_real_point_only": true,
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "comparison_mode_rows": 5,
  "single_mode_rows": 1,
  "historical_price_source_24h": "Yahoo Finance continuous Futures intraday 5m",
  "historical_price_source_7d_plus": "Yahoo Finance continuous Futures daily",
  "change_basis": "first real point of active window to inspected real point",
  "vertical_guide": true,
  "point_markers": true,
  "fixed_current_quote_panel_removed": true,
  "fabricated_points": false,
  "crypto_cursor_engine_unchanged": true,
  "collectors_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_inspector_full_5x5_layout`

```json
{
  "base": "28.2.70",
  "state": "ready_for_user_test",
  "visible_rows_comparison_mode": 5,
  "visible_rows_single_mode": 1,
  "row_overflow": false,
  "scroll_required": false,
  "crypto_table_density_reference_used": true,
  "header_compacted": true,
  "footer_compacted": true,
  "data_engine_changed": false,
  "nearest_point_engine_changed": false,
  "crypto_cursor_engine_unchanged": true,
  "collectors_unchanged": true,
  "bridge_unchanged": true
}
```

### Bridge, données marché et décision

#### `bridge_canonical_stack_recovery`

```json
{
  "base": "28.2.71",
  "state": "ready_for_user_test",
  "control_center": "V2.1.0R1",
  "bridge": "V1.7.6",
  "model": "llama3.2:latest",
  "interface": "Build 28.2.74",
  "bridge_scope": "crypto_history_scanner_reports_conclusion_chat",
  "metals_scope": "public_github_actions_archive_only",
  "metals_dev_dependency": false,
  "local_metals_bridge_fallback": false,
  "github_writes": false,
  "exchange_actions": false,
  "wallet_actions": false,
  "crypto_graph_changed": false,
  "metals_graph_changed": false,
  "collectors_changed": false
}
```

#### `decision_board_truth_contract`

```json
{
  "base": "28.2.72",
  "state": "validated_on_firefox_ryzen",
  "scope": "crypto_decision_board_visible_truth_contract_only",
  "archive_index_policy": "historical_watch_index_remains_visible_for_consultation",
  "archive_direct_analysis": "suspended",
  "archive_active_conclusion": "suspended",
  "archive_simulation": "suspended",
  "displayed_index_name": "Indice de veille Atlas",
  "source_counter_name": "flux CoinGecko",
  "source_counter_independent_providers_claimed": false,
  "category_reading_name": "Lecture catégories d’actifs",
  "action_basis": [
    "asset_category",
    "direct_or_archived_state"
  ],
  "action_depends_on_watch_index": false,
  "scoring_formula_changed": false,
  "anomaly_thresholds_changed": false,
  "movement_thresholds_changed": false,
  "memory_engine_changed": false,
  "news_sentinel_changed": false,
  "bridge_changed": false,
  "crypto_graph_changed": false,
  "metals_workspace_changed": false,
  "collectors_changed": false,
  "interface_geometry_changed": false
}
```

#### `coingecko_usd_eur_market_fallback`

```json
{
  "base": "28.2.73",
  "state": "retired_replaced_by_public_crypto_market_archive",
  "preferred_path": "CoinGecko Top 250 EUR direct",
  "fallback_path": "CoinGecko Top 250 USD direct + ECB USD/EUR public reference",
  "archive_policy": "only_after_eur_and_usd_eur_paths_fail",
  "fx_registry": "../data/metals/fx/usd_eur.json",
  "fx_source": "Banque centrale européenne",
  "fx_max_age_days": 10,
  "monetary_fields_converted_to_eur": [
    "current_price",
    "market_cap",
    "total_volume",
    "high_24h",
    "low_24h",
    "global_top250_market_cap",
    "global_top250_volume"
  ],
  "percentage_variations_basis": "CoinGecko USD",
  "fallback_source_lock_mode": "direct",
  "decision_board_enabled_on_valid_fallback": true,
  "fallback_provenance_visible": true,
  "archive_state_label_corrected": true,
  "scoring_formula_changed": false,
  "movement_thresholds_changed": false,
  "anomaly_thresholds_changed": false,
  "crypto_chart_changed": false,
  "metals_workspace_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "github_actions_changed": false,
  "interface_geometry_changed": false
}
```

#### `public_crypto_market_archive`

```json
{
  "base": "28.2.74",
  "state": "validated_on_firefox_ryzen",
  "collector": "../tools/collect_public_crypto.py",
  "workflow": ".github/workflows/atlas-public-crypto-market.yml",
  "snapshot_path": "../data/crypto/latest.json",
  "status_path": "../data/crypto/status.json",
  "market_source": "CoinGecko Top 250 USD",
  "fx_source": "ECB USD/EUR public reference",
  "publication_mode": "GitHub Actions static JSON",
  "schedule": "every_2_hours",
  "browser_direct_top250_required": false,
  "original_usd_preserved": true,
  "eur_values_converted_with_single_ecb_rate": true,
  "percentage_variations_base": "CoinGecko USD",
  "last_valid_preserved_on_failure": true,
  "decision_board_current_max_age_hours": 3,
  "display_max_age_hours": 24,
  "local_browser_cache_last_resort": true,
  "crypto_graphs_unchanged": true,
  "metals_workspace_unchanged": true,
  "bridge_unchanged": true,
  "github_write_scope": "public/agent_crypto_erith_ia/data/crypto only"
}
```

#### `canonical_snapshot_memory_deduplication_lock`

```json
{
  "base": "28.2.76",
  "state": "ready_for_user_test",
  "scope": "local_memory_and_decision_board_comparison_truth_only",
  "canonical_identity_source": "state.sourceLock.snapshotId",
  "canonical_timestamp_source": "state.sourceLock.timestamp",
  "one_record_per_collector_and_market_snapshot": true,
  "repeat_livechecks_increment_observation_count": true,
  "duplicate_market_observations_neutralized": true,
  "legacy_source_time_used_as_safe_fallback_identity": true,
  "legacy_records_deleted": false,
  "decision_board_requires_distinct_market_snapshots": true,
  "public_crypto_collector_changed": false,
  "github_actions_changed": false,
  "decision_board_formula_changed": false,
  "movement_thresholds_changed": false,
  "anomaly_thresholds_changed": false,
  "crypto_graphs_changed": false,
  "metals_workspace_changed": false,
  "bridge_changed": false,
  "interface_geometry_changed": false,
  "validation_state_truth_updates": [
    "decision_board_truth_contract_validated",
    "public_crypto_market_archive_validated",
    "publication_identity_single_source_lock_validated",
    "browser_direct_top250_fallback_retired"
  ]
}
```

### Pédagogie, simulation et parcours

#### `pedagogy_security_layer`

```json
{
  "base": "28.2.77",
  "state": "ready",
  "scope": "additive_simulation_pedagogy_and_security_gate",
  "dynamic_info_drawer": true,
  "simulation_cost_assumptions": [
    "buy_fee_pct",
    "sell_fee_pct",
    "entry_impact_pct",
    "exit_impact_pct"
  ],
  "cost_source_policy": "manual_or_explicit_school_example_never_claimed_as_kraken_rate",
  "break_even_estimate": true,
  "gross_and_estimated_net_pnl_separated": true,
  "instant_scenarios_pct": [
    -5,
    -3,
    -1,
    0,
    1,
    3,
    5
  ],
  "negative_zero_removed": true,
  "position_detail_fields": [
    "quantity",
    "average_entry",
    "current_price",
    "gross_value",
    "gross_pnl",
    "estimated_net_pnl"
  ],
  "security_gate_levels": [
    "green",
    "orange",
    "red"
  ],
  "security_gate_real_execution_authority": false,
  "school_mode_preserved": true,
  "all_existing_sections_preserved": true,
  "chart_truth_badge_short_label": "À JOUR",
  "chart_truth_badge_width_locked": true,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "real_exchange_key_used": false,
  "withdrawal_safety_lab": true,
  "withdrawal_lab_real_address_requested": false,
  "withdrawal_lab_real_transaction_possible": false,
  "scam_sentinel": true,
  "scam_signal_count": 8,
  "verification_scope": [
    "static_identity_and_json",
    "node_simulation_logic",
    "school_rule_regression",
    "chromium_inline_browser_smoke",
    "responsive_geometry_smoke"
  ],
  "firefox_publication_validation_required_after_upload": true,
  "public_github_pages_validation_performed": false
}
```

#### `inline_expert_learning_transaction_proof_lock`

```json
{
  "base": "28.2.78",
  "state": "ready_for_user_test",
  "scope": "additive_non_modal_pedagogy_expert_roadmap_and_local_transaction_proofs",
  "pedagogy_surface": "non_modal_right_dock_desktop_bottom_dock_mobile",
  "page_backdrop_blur_removed": true,
  "page_interaction_blocked_by_help": false,
  "pedagogy_minimize_and_close": true,
  "expert_roadmap_horizon_months": 24,
  "expert_roadmap_modules": 11,
  "expert_roadmap_local_notes": true,
  "expert_roadmap_export_markdown": true,
  "transaction_proof_schema": "agent_crypto_transaction_proof_v1",
  "transaction_proof_types": [
    "SIM_BUY",
    "SIM_SELL",
    "REFUS"
  ],
  "transaction_proof_exports": [
    "markdown",
    "json"
  ],
  "legacy_simulation_logs_migrated_non_destructively": true,
  "existing_pedagogy_security_layer_preserved": true,
  "all_existing_sections_preserved": true,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "real_exchange_key_used": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `dual_capital_simulation_profile_lock`

```json
{
  "base": "28.2.79",
  "state": "ready_for_public_firefox_validation",
  "scope": "simulation_profiles_only_additive",
  "default_profile": "Solo Progression 1 000 €",
  "preserved_profile": "Solo Débutant 100 €",
  "profile_1000": {
    "start_cash_eur": 1000,
    "default_ticket_eur": 50,
    "max_per_operation_eur": 100,
    "max_exposure_eur": 300,
    "min_reserve_eur": 700,
    "allowed_assets": [
      "BTC",
      "ETH",
      "SOL"
    ]
  },
  "profile_100": {
    "start_cash_eur": 100,
    "default_ticket_eur": 5,
    "max_per_operation_eur": 10,
    "max_exposure_eur": 30,
    "min_reserve_eur": 70,
    "allowed_assets": [
      "BTC",
      "ETH",
      "SOL"
    ]
  },
  "profile_state_isolated": true,
  "switching_profiles_deletes_other_state": false,
  "legacy_100_eur_state_migrated_non_destructively": true,
  "school_tests_scale_to_active_profile": true,
  "existing_sections_removed": false,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "real_exchange_key_used": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `learning_journey_cockpit_guided_practice_lock`

```json
{
  "base": "28.2.80",
  "state": "ready_for_public_firefox_validation",
  "title": "LEARNING JOURNEY COCKPIT & GUIDED PRACTICE LOCK",
  "additive_only": true,
  "real_money_used": false,
  "real_exchange_action": false,
  "features": [
    "daily_learning_cockpit",
    "recommended_next_module",
    "five_step_guided_session",
    "local_session_note",
    "session_markdown_export",
    "simulation_and_proof_shortcuts",
    "help_modes_off_short_detailed",
    "roadmap_and_simulation_state_summary"
  ],
  "preserved": [
    "all_28_2_80_sections",
    "dual_simulation_profiles",
    "expert_24_month_roadmap",
    "transaction_proof_ledger",
    "security_gate",
    "withdrawal_lab",
    "scam_sentinel",
    "crypto_workspace",
    "metals_workspace",
    "decision_board",
    "bridge_v1_7_6",
    "control_center_v2_1_0_r1"
  ]
}
```

#### `checkbox_layout_guided_session_ui_fix`

```json
{
  "base": "28.2.81",
  "state": "ready_for_public_firefox_validation",
  "title": "CHECKBOX LAYOUT & GUIDED SESSION UI FIX",
  "scope": "checkbox_geometry_and_guided_session_layout_only",
  "reported_environment": "Firefox on Ryzen",
  "visible_issue": "native checkboxes occupied the generic 100 percent input width and separated controls from their labels",
  "root_cause": "historical generic input textarea width rule also matched input type checkbox",
  "checkbox_square_size_px_desktop": 16,
  "checkbox_square_size_px_mobile": 17,
  "guided_session_rows_compact": true,
  "checkbox_and_label_left_aligned": true,
  "fixed_groups": [
    "guided_learning_session_steps",
    "simulation_cost_confirmation",
    "fictitious_withdrawal_checks",
    "scam_sentinel_checks"
  ],
  "html_structure_changed": false,
  "javascript_behavior_changed": false,
  "simulation_calculations_changed": false,
  "learning_progress_changed": false,
  "security_rules_changed": false,
  "existing_sections_removed": false,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `guided_lesson_notebook_cockpit_restart_lock`

```json
{
  "base": "28.2.82",
  "state": "ready_for_public_firefox_validation",
  "title": "GUIDED LESSON NOTEBOOK & COCKPIT RESTART LOCK",
  "reported_issue": "session comments were deliberately truncated and core lesson content depended on the external conversation",
  "root_causes": [
    "html_maxlength_800",
    "javascript_slice_800",
    "single_note_field_mixed_reference_notes_and_personal_conclusion",
    "no_integrated_lesson_content",
    "completed_sessions_not_archived_as_full_notes"
  ],
  "cockpit_restart": true,
  "previous_cockpit_storage_preserved": true,
  "previous_roadmap_storage_preserved": true,
  "new_cockpit_storage_key": "agent_crypto_learning_journey_cockpit_28_2_83",
  "new_roadmap_storage_key": "agent_crypto_expert_roadmap_28_2_83",
  "integrated_lessons": 11,
  "notes_deliberately_truncated": false,
  "free_notes_and_takeaway_separated": true,
  "autosave": true,
  "character_counters": true,
  "session_history_archive": true,
  "complete_notebook_markdown_export": true,
  "technical_target_names_replaced_by_french_labels": true,
  "five_steps_required_for_completion": true,
  "existing_simulation_profiles_preserved": true,
  "simulation_calculations_changed": false,
  "security_rules_changed": false,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `legacy_learning_recovery_notebook_migration_lock`

```json
{
  "base": "28.2.83",
  "state": "ready_for_public_firefox_validation",
  "title": "LEGACY LEARNING RECOVERY & NOTEBOOK MIGRATION LOCK",
  "source_cockpit_key": "agent_crypto_learning_journey_cockpit_28_2_81",
  "source_roadmap_key": "agent_crypto_expert_roadmap_28_2_79",
  "target_cockpit_key": "agent_crypto_learning_journey_cockpit_28_2_83",
  "target_history_key": "agent_crypto_learning_journey_history_28_2_83",
  "target_roadmap_key": "agent_crypto_expert_roadmap_28_2_83",
  "preview_before_import": true,
  "manual_import": true,
  "ignore_without_delete": true,
  "backup_before_merge": true,
  "old_keys_preserved": true,
  "duplicate_import_blocked_by_signature": true,
  "legacy_single_note_imported_to_free_notes": true,
  "legacy_takeaway_invented": false,
  "legacy_progress_preserved": true,
  "truth_policy": "text already truncated by the old 800-character format cannot be reconstructed; all characters still present are imported exactly",
  "expert_roadmap_note_deliberate_limit_removed": true,
  "simulation_profiles_preserved": true,
  "simulation_calculations_changed": false,
  "security_rules_changed": false,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `legacy_recovery_action_progress_restore_fix`

```json
{
  "base": "28.2.84",
  "state": "ready_for_public_validation",
  "automatic_startup_recovery": true,
  "manual_import_required": false,
  "post_write_readback_required": true,
  "legacy_source_keys_preserved": true,
  "legacy_marker_not_trusted_without_target_audit": true,
  "recovery_targets": [
    "roadmap",
    "session_history",
    "active_learning_draft",
    "full_remaining_note_text"
  ],
  "explicit_failure_state": true,
  "quota_error_visible": true,
  "anti_duplicate": true,
  "expected_user_case": {
    "completed_sessions": 1,
    "progressed_modules": 1,
    "active_module": "spot",
    "remaining_note_characters": 550,
    "legacy_checked_steps": 3
  },
  "simulation_calculations_unchanged": true,
  "collectors_unchanged": true,
  "workflows_unchanged": true,
  "bridge_unchanged": true
}
```

#### `learning_notebook_indexeddb`

```json
{
  "base": "28.2.85",
  "state": "ready",
  "backend": "IndexedDB",
  "database": "agent_crypto_learning_notebook",
  "store": "notebook",
  "record": "learning_notebook_primary",
  "localstorage_source_read_only": true,
  "localstorage_quota_dependency_removed_for_learning_notebook": true,
  "automatic_legacy_recovery": true,
  "post_write_readback_verification": true,
  "legacy_keys_preserved": true,
  "expected_recovery": {
    "completed_sessions": 1,
    "progressed_modules": 1,
    "active_module": "spot",
    "compatible_steps": 3,
    "note_characters": 550
  },
  "no_operator_click_required": true,
  "retired_localstorage_targets_backed_up_in_indexeddb": true,
  "retired_localstorage_targets_removed_after_verified_write": true,
  "legacy_source_keys_preserved_paths": [
    "agent_crypto_learning_journey_cockpit_28_2_81",
    "agent_crypto_expert_roadmap_28_2_79"
  ],
  "learning_target_keys_retired_after_migration": [
    "agent_crypto_learning_journey_cockpit_28_2_83",
    "agent_crypto_learning_journey_history_28_2_83",
    "agent_crypto_expert_roadmap_28_2_83",
    "agent_crypto_learning_legacy_migration_28_2_84",
    "agent_crypto_learning_legacy_backup_28_2_84",
    "agent_crypto_learning_legacy_recovery_audit_28_2_85"
  ],
  "scope_limit": "learning notebook and roadmap only; simulation profile storage remains unchanged"
}
```

#### `guided_learning_flow_readme_canonical_reset_lock`

```json
{
  "base": "28.2.86",
  "state": "ready_for_public_firefox_validation",
  "title": "GUIDED LEARNING FLOW & CANONICAL README RESET LOCK",
  "mission": "one_primary_action_from_lesson_to_next_module_without_guessing",
  "reopened_archived_session_repair": true,
  "archive_idempotent_by_session_id": true,
  "completed_at_cleared_only_by_explicit_new_session": true,
  "completion_card_visible": true,
  "next_module_button_visible": true,
  "automatic_proof_checkboxes_read_only": true,
  "exercise_return_guide": true,
  "risk_module_evidence": [
    "school_cost_example",
    "scenario_minus_3_percent",
    "scenario_plus_5_percent"
  ],
  "current_expected_transition": "02_spot_archived_to_03_fees_and_risk",
  "learning_storage_backend": "IndexedDB",
  "learning_storage_keys_changed": false,
  "simulation_storage_changed": false,
  "market_collectors_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "decision_board_changed": false,
  "real_order_performed": false,
  "wallet_connected": false,
  "github_write_performed": false,
  "canonical_readme_replaced_in_delivery": true
}
```

#### `recovery_context_practice_status_reconciliation_lock`

```json
{
  "base": "28.2.87",
  "state": "ready_for_public_firefox_validation",
  "title": "RECOVERY CONTEXT & PRACTICE STATUS RECONCILIATION LOCK",
  "legacy_recovery_panel_historical_context_explicit": true,
  "legacy_draft_label": "ancien_brouillon_recupere",
  "current_cockpit_module_displayed_separately": true,
  "archived_guided_practice_reconciles_roadmap": true,
  "reconciliation_evidence": [
    "completed_at",
    "five_steps_complete",
    "practice_true",
    "verify_true",
    "session_id"
  ],
  "existing_archives_duplicated": false,
  "indexeddb_keys_changed": false,
  "simulation_storage_changed": false,
  "market_collectors_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "decision_board_changed": false,
  "real_order_performed": false,
  "wallet_connected": false,
  "github_write_performed": false
}
```

#### `cockpit_interaction_restoration_readability_lock`

```json
{
  "base": "28.2.88",
  "state": "ready_for_human_validation",
  "scope": "learning_cockpit_only",
  "checkboxes_clickable": true,
  "checkbox_change_listener_restored": true,
  "lesson_button_preserved": true,
  "primary_action_preserved": true,
  "readability_source": "28.2.89 canonical cockpit CSS only",
  "indexeddb_schema_unchanged": true,
  "storage_keys_unchanged": true,
  "crypto_workspace_unchanged": true,
  "metals_workspace_unchanged": true,
  "bridge_unchanged": true,
  "decision_board_unchanged": true
}
```

#### `foundations_learning_path_01_03_lock`

```json
{
  "status": "implemented",
  "scope": [
    "module_01_market_data",
    "module_02_spot_orderbook",
    "module_03_fees_risk"
  ],
  "storage_schema_changed": false,
  "archived_sessions_changed": false,
  "market_metals_bridge_changed": false,
  "principle": "definition -> exact panel -> exact control -> expected result -> beginner interpretation"
}
```

#### `full_learning_journey_reset_module_01_lock`

```json
{
  "status": "implemented",
  "base": "28.2.91",
  "button": "Recommencer tout depuis le Module 01",
  "double_confirmation": true,
  "typed_confirmation": "RECOMMENCER MODULE 01",
  "automatic_backup": {
    "download": "JSON before reset",
    "indexeddb": "last_reset_backup"
  },
  "cleared": [
    "current learning draft",
    "archived learning sessions",
    "learning notes",
    "learning conclusions",
    "learning roadmap states"
  ],
  "preserved": [
    "Market",
    "Metals",
    "Bridge",
    "simulation portfolio",
    "transaction proofs",
    "collectors",
    "general settings"
  ],
  "restart_state": {
    "module": "01 · Marché et données",
    "steps": "0/5",
    "progress": "0 %"
  },
  "legacy_reimport_blocked_after_reset": true,
  "storage_schema_changed": false,
  "indexeddb_name_version_store_record_changed": false
}
```

#### `current_module_step_one_restart_lock`

```json
{
  "base": "28.2.92",
  "includes_foundation_evidence_validation_from": "28.2.93-unpublished-candidate",
  "state": "ready_for_public_firefox_validation",
  "removed_behavior": "restart_steps_2_to_4_only",
  "button_label": "Recommencer ce module depuis l’étape 1",
  "restart_scope_cleared": [
    "lesson_read_state",
    "five_current_draft_steps",
    "current_draft_notes",
    "current_draft_takeaway",
    "current_module_practice_evidence"
  ],
  "preserved": [
    "archived_learning_sessions",
    "other_modules",
    "Market",
    "Metals",
    "Bridge",
    "simulation_portfolio",
    "transaction_proofs",
    "collectors",
    "general_settings"
  ],
  "confirmation_required_when_content_exists": true,
  "foundation_upgrade_button_uses_same_restart_function": true,
  "return_target": "integrated_lesson_step_1",
  "full_journey_reset_module_01_preserved": true,
  "storage_schema_changed": false,
  "storage_keys_changed": false
}
```

#### `cockpit_recovery_actionability_separate_simulation_reset_lock`

```json
{
  "base": "28.2.94",
  "state": "ready_for_manual_publication",
  "scope": "learning_cockpit_only",
  "firefox_open_options_geometry_repaired": true,
  "session_options_full_width": true,
  "active_step_has_direct_action_button": true,
  "future_step_buttons_dependency_locked": true,
  "foundation_evidence_only_validation_preserved": true,
  "foundation_target_return_guide_visible": true,
  "separate_simulation_reset_visible_in_cockpit": true,
  "simulation_reset_preserves_learning": true,
  "module_restart_from_step_one_preserved": true,
  "full_learning_reset_module_one_preserved": true,
  "market_unchanged": true,
  "metals_unchanged": true,
  "bridge_unchanged": true,
  "collectors_unchanged": true
}
```

#### `direct_current_action_neutral_labels_lock`

```json
{
  "base": "28.2.95",
  "state": "ready_for_manual_publication",
  "scope": "learning_cockpit_primary_action_only",
  "neutral_heading": "Prochaine étape",
  "removed_promotional_phrases": [
    "Continuer sans chercher où cliquer",
    "Apprendre sans deviner quoi taper"
  ],
  "risk_step_2_direct": "load_school_cost_example",
  "risk_step_3_direct": "create_virtual_btc_50_position",
  "risk_step_4_targeted": "open_and_highlight_minus3_plus5_scenarios",
  "spot_step_4_direct": "create_virtual_btc_50_position",
  "market_steps_direct": [
    "launch_livecheck",
    "read_bitcoin",
    "validate_prudent_conclusion"
  ],
  "simulation_real_execution": false,
  "market_metals_bridge_collectors_unchanged": true
}
```

#### `full_restart_learning_active_simulation_lock`

```json
{
  "base": "28.2.96",
  "build": "28.2.97",
  "scope": "reset_contract_only",
  "button_label": "Repartir entièrement depuis le Module 01",
  "typed_confirmation": "REPARTIR MODULE 01",
  "backup_includes": [
    "learning_notebook",
    "active_simulation",
    "active_simulation_costs",
    "temporary_scenario"
  ],
  "clears": [
    "learning_draft",
    "learning_history",
    "learning_notes",
    "learning_conclusions",
    "learning_roadmap",
    "active_simulation_positions",
    "active_simulation_realized_pnl",
    "active_simulation_log",
    "active_simulation_costs",
    "temporary_scenario"
  ],
  "preserves": [
    "market",
    "metals",
    "bridge",
    "other_simulation_profile",
    "collectors",
    "general_settings"
  ],
  "learning_backend": "IndexedDB",
  "simulation_backend": "localStorage",
  "dual_verification": true,
  "rollback_on_failure": true
}
```

#### `internal_agent_crypto_clean_reset_lock`

```json
{
  "base": "28.2.97",
  "build": "28.2.98",
  "scope": "Agent-Crypto local learning and simulations only",
  "visible_reset_controls": 1,
  "button_label": "Repartir de zéro",
  "confirmation_count": 1,
  "typed_confirmation": false,
  "automatic_json_download": false,
  "clears": [
    "learning_cockpit",
    "learning_history",
    "learning_notes",
    "learning_conclusions",
    "learning_roadmap",
    "learning_recovery_state",
    "all_fictional_simulation_profiles",
    "simulation_positions",
    "simulation_logs",
    "simulation_costs",
    "temporary_scenario"
  ],
  "preserves": [
    "market",
    "metals",
    "bridge",
    "collectors",
    "general_settings",
    "GitHub",
    "YouTube",
    "browser_passwords",
    "browser_cookies",
    "other_BlueAzur_interfaces"
  ],
  "learning_backend": "IndexedDB",
  "simulation_backend": "localStorage",
  "indexeddb_transaction_handlers_installed_before_requests": true,
  "readback_verification": true,
  "rollback_with_explicit_error_code": true,
  "success_state": "Module 01 · 0/5 · no learning archive · default fictional capital · no position",
  "manual_browser_storage_cleanup_required": false,
  "ctrl_f5_required": false
}
```

#### `livecheck_step_2_direct_validation_lock`

```json
{
  "base": "28.2.98",
  "build": "28.2.99",
  "scope": "Module 01 step 2 only",
  "manual_livecheck_handlers": 1,
  "polling_watcher_removed": true,
  "validation_trigger": "successful manual runLivecheck completion",
  "required_proofs": [
    "live_ok",
    "market_rows",
    "bitcoin_row",
    "source",
    "timestamp",
    "visible_source",
    "visible_time"
  ],
  "learning_backend": "IndexedDB",
  "write_readback_required": true,
  "success_state": "Module 01 · 2/5 · step 3 enabled",
  "success_scroll_target": "learningFoundationPanel",
  "failure_state": "Module 01 · 1/5 with explicit message",
  "reset_28_2_98_unchanged": true,
  "market_metals_bridge_collectors_unchanged": true
}
```

#### `livecheck_step_3_market_target_lock`

```json
{
  "base": "28.2.99",
  "build": "28.3.00",
  "scope": "Module 01 post-Livecheck navigation only",
  "step_2_validation_unchanged": true,
  "success_scroll_target": "MARKET SNAPSHOT bitcoin row",
  "learning_foundation_panel_bounce_removed": true,
  "success_feedback_anchor": "bitcoin row or market workspace fallback",
  "existing_28_2_99_learning_state_compatible": true,
  "reset_required": false,
  "reset_28_2_98_unchanged": true,
  "market_metals_bridge_collectors_simulation_unchanged": true
}
```

#### `conclusion_step_5_instant_validation_lock`

```json
{
  "base": "28.3.00",
  "build": "28.3.01",
  "scope": "Module 01 step 5 completion and autonomous guidance only",
  "step_4_success_target": "Ce que je retiens — conclusion personnelle",
  "autonomous_prompt_visible": true,
  "external_ai_required": false,
  "validation_trigger": "textarea input after 220 ms debounce",
  "minimum_useful_characters": 20,
  "prerequisites": [
    "read",
    "open",
    "practice",
    "verify"
  ],
  "success_state": "Module 01 · 5/5 · Terminer et archiver enabled",
  "full_cockpit_rerender_on_validation": true,
  "reset_required": false,
  "market_metals_bridge_collectors_simulation_unchanged": true
}
```

#### `single_action_lesson_autonomous_guided_flow_lock`

```json
{
  "base": "28.3.01",
  "build": "28.3.02",
  "scope": "Module 01 guided flow clarity and single-action lesson validation",
  "step_1_primary_action": "J’ai lu la leçon — passer à Livecheck",
  "second_lesson_confirmation_removed": true,
  "step_1_transition": "single click validates read and exposes Livecheck",
  "step_4_primary_action": "Vérifier automatiquement source + heure",
  "step_4_manual_search_required": false,
  "active_28_3_01_session_compatible": true,
  "reset_required": false,
  "market_metals_bridge_collectors_simulation_unchanged": true
}
```

#### `autonomous_archive_guided_flow_coherence_lock`

```json
{
  "base": "28.3.02",
  "build": "28.3.03",
  "scope": "Module 01 completion coherence and visible publication identity",
  "step_5_archive": "automatic after valid personal conclusion",
  "extra_archive_click_required": false,
  "roadmap_update": "immediate after archive",
  "expected_post_completion": [
    "session archived",
    "Module 01 roadmap practiced",
    "progress no longer 0 percent",
    "module 02 available"
  ],
  "snapshot_label": "Lecture du snapshot Bitcoin",
  "spot_snapshot_distinction_visible": true,
  "step_4_wording_matches_direct_automatic_action": true,
  "visible_build_labels_synchronized": true,
  "preserved": [
    "reset",
    "Market",
    "Metals",
    "Bridge",
    "collectors",
    "fictional simulation",
    "existing learning archives"
  ]
}
```

#### `explicit_lesson_validation_verified_archive_lock`

```json
{
  "base": "28.3.03",
  "build": "28.3.04",
  "scope": "guided learning interaction correction only",
  "step_1_primary_action": "opens and scrolls to the lesson only",
  "step_1_validation_button": "visible below the lesson",
  "lesson_remains_available_after_validation": true,
  "step_5_effect": "validates conclusion only",
  "archive_action": "distinct visible Terminer et archiver button",
  "archive_persistence": "IndexedDB write followed by verified read-back",
  "archive_failure": "rollback to visible 5/5 unarchived state with explicit error",
  "completed_module_visibility": "lesson, five-step plan and notebook remain visible",
  "next_module_action": "distinct button in completion panel",
  "no_claim_of_human_comprehension": "completed cards say Preuve enregistrée",
  "reset_required": false,
  "preserved": [
    "reset",
    "Market",
    "Metals",
    "Bridge",
    "collectors",
    "fictional simulation",
    "existing learning archives"
  ],
  "dead_dom_references_removed": [
    "offlineNotice",
    "btnFoundationResetPath",
    "btnNewLearningSession",
    "btnResetLearningSimulation"
  ]
}
```

#### `module_01_guided_conclusion_pedagogy_lock`

```json
{
  "base": "28.3.04",
  "build": "28.3.05",
  "scope": "Module 01 pedagogy only",
  "step_1": "explicit lesson opening and visible post-reading validation preserved",
  "step_2": "Livecheck proof with IndexedDB read-back preserved",
  "step_3": "explicit BTC price 24h 7d observation with separate confirmation",
  "step_4": "explicit source and time confirmation; no hidden search",
  "step_5": "generated factual synthesis plus explicit prediction question",
  "correct_answer": "Non",
  "mandatory_free_text_removed": true,
  "personal_notes": "optional and never validate Module 01",
  "archive": "separate explicit button with IndexedDB verification",
  "next_module": "separate action after archived Module 01 remains visible",
  "active_28_3_04_draft_migration": "old text length cannot preserve step 5 without guided evidence",
  "reset_required": false,
  "preserved": [
    "reset 28.2.98",
    "Market",
    "Metals",
    "Bridge",
    "collectors",
    "fictional simulation",
    "existing archives"
  ]
}
```

#### `foundations_guided_pedagogy_01_03`

```json
{
  "base": "28.3.05",
  "state": "ready",
  "modules": [
    "01 · Marché et données",
    "02 · Spot et carnet d’ordres",
    "03 · Frais et gestion du risque"
  ],
  "module_01_polish": [
    "indexeddb_archive_count_message",
    "market_snapshot_vs_binance_spot_explicit"
  ],
  "module_02_flow": [
    "lesson",
    "best_bid_ask",
    "market_vs_limit",
    "fictional_btc_50_position",
    "guided_execution_conclusion"
  ],
  "module_03_flow": [
    "lesson",
    "school_cost_example",
    "fictional_btc_50_position",
    "minus3_plus5_scenarios",
    "guided_net_result_conclusion"
  ],
  "free_text_required": false,
  "archive_separate": true,
  "next_module_separate": true,
  "real_orders": false,
  "wallet": false,
  "api_keys": false
}
```

#### `foundations_evidence_snapshot_consolidation_01_03`

```json
{
  "base": "28.3.06",
  "build": "28.3.07",
  "state": "ready",
  "scope": "Foundations 01–03 evidence stability and code/test consolidation",
  "module_01": {
    "price_24h_7d": "frozen at explicit step 3 validation",
    "source_time": "frozen at explicit step 4 validation",
    "live_market_can_continue_without_mutating_session": true,
    "archive_uses_frozen_evidence": true
  },
  "module_02": {
    "position_summary": "already evidence-backed and preserved",
    "behavior_changed": false
  },
  "module_03": {
    "scenario_anchor": "position entry price and invested amount",
    "scenario_model": "simplified gross change minus explicit round-trip pedagogical costs",
    "minus_3_and_plus_5_frozen_at_test": true,
    "live_market_can_continue_without_mutating_scenario_evidence": true,
    "active_28_3_06_draft_migration": "legacy scenario evidence returns to step 4 only; earlier steps and completed archives are preserved"
  },
  "code_cleanup": [
    "remove unused free-text threshold constant",
    "remove unused conclusion length helper",
    "update persistence reason build marker",
    "repair current contract harness"
  ],
  "preserved": [
    "Module 01 archive",
    "roadmap progression",
    "Market",
    "Metals",
    "Bridge",
    "collectors",
    "reset 28.2.98",
    "fictional simulation safety"
  ],
  "reset_required": false,
  "real_orders": false,
  "wallet": false,
  "api_keys": false
}
```

#### `security_guided_pedagogy_04_05`

```json
{
  "base": "28.3.07",
  "build": "28.3.08",
  "status": "ready_for_local_chromium_and_public_firefox_validation",
  "scope": [
    "module_04_account_security",
    "module_05_wallet_withdrawals"
  ],
  "module_04_evidence": [
    "security_stack",
    "fake_support_refusal",
    "security_plan_snapshot",
    "guided_conclusion"
  ],
  "module_05_evidence": [
    "asset_network_match",
    "independent_destination_method",
    "small_test_and_trace_plan",
    "guided_conclusion"
  ],
  "real_credentials_collected": false,
  "real_address_collected": false,
  "real_transaction_performed": false,
  "notes_optional": true,
  "archive_and_next_module_separate": true,
  "old_unfinished_04_05_draft_policy": "preserve_lesson_read_then_restart_at_step_2",
  "modules_01_03_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "reset_changed": false,
  "simulation_engine_changed": false,
  "research_basis": [
    "ANSSI MFA and password recommendations",
    "AMF PSCA and unauthorized actor warnings",
    "Kraken account security, GSL, withdrawal network and confirmation documentation"
  ]
}
```

#### `knowledge_guided_pedagogy_06_08`

```json
{
  "build": "28.3.09",
  "base": "28.3.08",
  "scope": [
    "module_06_stablecoins_tokenomics",
    "module_07_smart_contracts_defi",
    "module_08_staking_yields"
  ],
  "modules_01_05_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "reset_changed": false,
  "simulation_engine_changed": false,
  "real_stablecoin_selected": false,
  "real_wallet_connected": false,
  "real_contract_interaction": false,
  "real_approval_or_signature": false,
  "real_staking_or_deposit": false,
  "evidence_mode": "frozen_at_validation",
  "free_notes_required": false,
  "archive_separate_from_next_module": true,
  "active_draft_migration": "preserve_step_1_clear_steps_2_5_for_modules_06_08"
}
```

#### `mastery_guided_pedagogy_09_11`

```json
{
  "build": "28.3.10",
  "base": "28.3.09",
  "scope": [
    "module_09_derivatives_liquidation",
    "module_10_scams_investigation",
    "module_11_records_tax"
  ],
  "modules_01_08_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "reset_changed": false,
  "simulation_engine_changed": false,
  "real_derivative_opened": false,
  "real_entity_assessed": false,
  "real_personal_data_collected": false,
  "real_tax_calculation": false,
  "personalized_tax_advice": false,
  "evidence_mode": "frozen_at_validation",
  "free_notes_required": false,
  "archive_separate_from_next_module": true,
  "active_draft_migration": "preserve_step_1_clear_steps_2_5_for_modules_09_11"
}
```

#### `learning_state_continuity_order_completion_lock`

```json
{
  "build": "28.3.11",
  "base": "28.3.10",
  "scope": [
    "per_module_pedagogy_versions",
    "active_draft_continuity",
    "strict_step_order_1_to_5",
    "explicit_journey_completion_11_of_11"
  ],
  "module_versions": {
    "market": "28.3.07",
    "spot": "28.3.07",
    "risk": "28.3.07",
    "account": "28.3.08",
    "wallet": "28.3.08",
    "tokenomics": "28.3.09",
    "defi": "28.3.09",
    "yield": "28.3.09",
    "derivatives": "28.3.10",
    "scams": "28.3.10",
    "records": "28.3.10"
  },
  "unchanged_active_drafts_preserved": true,
  "step_2_blocked_before_lesson_ui": true,
  "step_2_blocked_before_lesson_handler": true,
  "module_11_next_state": "journey_complete_11_11",
  "automatic_module_01_restart": false,
  "modules_content_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "reset_changed": false,
  "simulation_engine_changed": false,
  "public_firefox_indexeddb_validation_required": true
}
```

#### `real_browser_persistence_recovery_evidence_lock`

```json
{
  "base": "28.3.11",
  "scope": [
    "indexeddb_write_readback",
    "serialized_persistence_queue",
    "reload_and_reopen_recovery",
    "non_destructive_integrity_diagnostic",
    "explicit_storage_error_codes",
    "simulation_store_separation"
  ],
  "notebook_schema": "agent_crypto_learning_notebook_indexeddb_v2",
  "persistence_evidence_schema": "agent_crypto_learning_persistence_evidence_v2",
  "diagnostic_schema": "agent_crypto_learning_integrity_report_v2",
  "error_codes": [
    "LEARNING-IDB-OPEN",
    "LEARNING-IDB-BLOCKED",
    "LEARNING-IDB-READ",
    "LEARNING-IDB-WRITE",
    "LEARNING-IDB-VERIFY",
    "LEARNING-STORAGE-QUOTA"
  ],
  "automatic_repair": false,
  "automatic_reset": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "pedagogy_content_changed": false,
  "simulation_engine_changed": false,
  "reset_changed": false,
  "chromium_real_indexeddb_tested": false,
  "public_firefox_existing_profile_validation_required": true
}
```

### Persistance et continuité

#### `fail_closed_persistence_reset_serialization_diagnostic_truth_lock`

```json
{
  "base": "28.3.12",
  "scope": [
    "fail_closed_initial_read",
    "two_phase_verification_evidence",
    "canonical_reset_serialization",
    "record_pure_diagnostic",
    "bidirectional_archive_roadmap_consistency",
    "pagehide_persistence_flush",
    "truthful_test_metadata"
  ],
  "initial_read_failure_writes": 0,
  "reset_uses_canonical_queue": true,
  "stale_generation_rejected": true,
  "verified_metadata_written_after_readback": true,
  "diagnostic_global_cache_reads": false,
  "roadmap_archive_consistency": "bidirectional",
  "pagehide_flush_installed": true,
  "chromium_real_indexeddb_tested": false,
  "firefox_existing_profile_validation_required": true,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "pedagogy_content_changed": false,
  "simulation_engine_changed": false
}
```

### Autres métadonnées historiques

#### `foundation_evidence_only_validation`

```json
{
  "base": "28.2.92",
  "state": "historical_superseded",
  "modules": [
    "market",
    "spot",
    "risk"
  ],
  "checkboxes": "read_only_status_indicators",
  "manual_step_mutation_blocked": true,
  "validation_sources": [
    "integrated_lesson",
    "livecheck",
    "foundation_answers",
    "school_simulation",
    "instant_scenarios"
  ],
  "conclusion_prerequisites": [
    "read",
    "open",
    "practice",
    "verify"
  ],
  "conclusion_minimum_characters": 20,
  "early_text_preserved": true,
  "non_foundation_modules_unchanged": true,
  "full_learning_reset_preserved": true,
  "market_metals_bridge_collectors_unchanged": true,
  "superseded_by": "module_01_guided_conclusion_pedagogy_lock",
  "current_conclusion_validation": "guided evidence answer; no character threshold"
}
```

---

Extraction : 64 sections historiques déplacées depuis `version.json` 28.3.17.
