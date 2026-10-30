# Atlas-10 Crypto Bridge R17 / V1.9.13 — GitHub Transport Resilience Lock for Agent-Crypto 40.6.485

## Terrain trigger

R16 / Bridge V1.9.12 was READY on 8787 with GitHub credential READY, but two real operator attempts to archive the first 500-Evidence chunk ended with:

`<urlopen error The write operation timed out>`

No cold chunk was declared VERIFIED and no local Evidence was deleted.

## Root cause corrected

1. Oracle Evidence blob creation used a 25 s GitHub timeout.
2. The first real JSONL payload is **4,269,455 bytes** for 500 Evidence.
3. Cold readback used Repository Contents semantics that are not appropriate for embedded content above 1 MiB.

R17 / V1.9.13 changes only transport resilience:
- small Git operations: 45 s;
- large Git blob write: 180 s;
- cold readback: 120 s;
- one bounded retry on timeout/network failure;
- large-file readback: Repository Contents object metadata -> exact Git Blob endpoint;
- exhausted failures become `GITHUB_TIMEOUT` / `GITHUB_NETWORK_ERROR` instead of raw urllib text.

## Version truth

- Control Center: **2.3.2R17**
- Bridge: **V1.9.13**
- Agent-Crypto: **40.6.485**
- Bridge: `127.0.0.1:8787`
- Private Backend: **V1.4.2**, `127.0.0.1:8790`, byte-identical / unchanged
- Seven Vault: `127.0.0.1:8780`, outside scope

## Real bundle regression fixture

- rows: 500
- JSONL bytes: 4,269,455
- SHA-256: `0492dd842d38040854d445d40f51e2030d43d474d6e934d65b8d3aed6871a66f`

## R17 source hashes

- `bridge/bridge.py`: `abc821e68bc77d183894581c743a085a450edfa06b49348a7c0f374a834b7ec4`
- `bridge/bridge_config.json`: `9b814ebe1bfacffd05320217af0fa3b019eefc49a032bec529bcc7fbcd951d3a`
- `backend/private_backend.py`: `77a69691932ebcfb82bc43c6e0da9289bad08054753280a8f80e6ab8d5a8bc7f`
- `source/main.go`: `be5977d870ab738ce8c7d7b13341d312b7d7d22747d1c089d08702f481fe3da0`
- `source/payload.zip`: `6c8960ea994071b6225ac3a2966c278c3ffdd25dd5a1eb7fcb3e7027b1bb7c68`

## Windows build proof

R17 EXE SHA-256:

`137bd1ac81a3cb8895e18bc1ef15236031f12e15156c676a17e145274c6bd313`

Build:
`GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags "-H windowsgui -s -w"`

Proof:
- PE32+ x86-64;
- Windows GUI subsystem;
- deterministic second rebuild produced identical SHA.

## Static resilience proof

PASS:
- real 500-row bundle validation;
- simulated first write timeout then successful retry;
- simulated repeated timeout -> explicit `GITHUB_TIMEOUT`;
- simulated >1 MiB cold readback -> object metadata -> Git Blob;
- Bridge Python compile;
- Backend Python compile;
- Backend V1.4.2 hash unchanged.

## Safety lock

No local delete API.
No local retention reduction.
No token in Firefox.
No generic GitHub browser write.
No Backend 8790 mutation.
No Market Core / Strategy A / Oracle Math change.
No real order.

Wine runtime proof is not claimed. Final GitHub transport proof belongs to the Ryzen Windows terrain test.
