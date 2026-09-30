# HANDOFF — Agent-Crypto 40.6.487

## Proven checkpoint before automation

40.6.485 terrain PASS:
- Bridge V1.9.13 READY;
- GitHub local PRÊT;
- first real 500-row chunk VERIFIED;
- public readback PASS;
- archived_rows = 500;
- chunks = 1;
- local Evidence count did not decrease.

## 40.6.487 objective

Archive the remaining backlog without requiring ~70 manual clicks and without weakening proof semantics.

## Mandatory gates

- Bridge version = V1.9.13.
- Bridge Oracle Evidence `enabled=true`.
- GitHub local credential ready.
- one archive owner at a time.
- one chunk in flight.
- VERIFIED before next chunk.
- fixed target per pass.
- exact public receipt proof.
- zero local delete.

## Operator terrain

1. Bridge V1.9.13 running.
2. Open Build 40.6.487.
3. Oracle → Evidence & validation.
4. Confirm the manual 500 button is disabled by the AUTO owner.
5. Click **Archiver automatiquement** once.
6. Observe at least two consecutive chunks reach VERIFIED without another click.
7. Click **Pause après ce chunk** and require AUTO_PAUSED after a VERIFIED boundary.
8. Click **Reprendre** and require continuation after the same watermark.
9. Optional: **Arrêter après ce chunk**, then Start again and prove resume from Bridge VERIFIED watermark.
10. Confirm local Evidence count never decreases.

After queue completion and Pages propagation:
- click **Vérifier fin publiée** once;
- require `FINAL_PUBLIC_EXACT_VERIFY_PASS`.

## Important

Do not start retention/HOT-window deletion work in this build.

Cold durability and archive automation remain separate from local retention.
