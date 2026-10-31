# Administrator scanner ownership — approved release

Base: Administrator 40.6.716, source blob SHA locked for app.js, index.html, build.json, legacy USD module.

Goal: Remove competing global scanner override; use app.js single scanner owner; replace versioned application module `graph-native-usd-406520.js` with stable `graph-native-usd.js`, migrate runtime API, update index and build metadata.

Delivery: 40.6.717, source on main, one four-file incremental ZIP, checksum and handoff in shared coordination folder, explicit Pages deployment; Firefox 5/5 validation pending operator.

No Market Core, Bridge, Vault or actual trades changed. This is a direct response to the owner's failed 40.6.716 Firefox acceptance.
