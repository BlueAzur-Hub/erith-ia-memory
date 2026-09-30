# Oracle Evidence · Cold Archive

Build foundation: **40.6.482**.

Purpose:
- Browser / IndexedDB = hot working memory.
- GitHub `data/oracle_evidence` = cold durable memory.
- Notion = human control plane / handoff.
- Safe local Bridge/backend = future authenticated ingest transport.

## 40.6.482 safety lock

This build does **not** delete local Evidence.
It does **not** write to GitHub from browser JavaScript.
It embeds **no GitHub token**.
It may only:
1. read the same-origin cold manifest on operator request;
2. read a bounded local IndexedDB cursor chunk;
3. calculate SHA-256 + row count + watermark;
4. download one transport bundle;
5. verify a published cold JSONL chunk.

Local retention remains forbidden until a later build proves:
- cold chunk published;
- SHA-256 match;
- row count match;
- JSONL parses;
- manifest committed;
- replay/readback succeeds.

The intended next step is a safe Bridge/backend ingest owner.
