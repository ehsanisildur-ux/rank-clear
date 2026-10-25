# Submission

**Category:** Builder → Intelligent Contracts

**Title:** RankClear: Consensus seniority clearing envelopes

**Notes / Description** (968 characters):

RankClear is a standalone GenLayer seniority-clearing oracle. A fixed publisher and immutable creditor priorities define each instance. Leader and validators independently fetch complete commit-pinned statements, verify SHA-256, and interpret all available-cash and due-claim quantities, including corrections, explicit zero and UNKNOWN. Exact quantity agreement plus full-source audits gate append-only snapshots. Integer waterfalls compute least and greatest fixed points, exposing default cascades and circular-payment ambiguity. Read-only cash-injection queries recompute both bounds. Four StudioNet suites cover a default chain, an unfunded cycle, changed seniority and unresolved cash; 20 finalized receipts and 36 stress views match independent oracles and fresh state. Includes 598 direct tests, exhaustive small-system checks and rejected-call rollback proofs. Synthetic statements demonstrate the mechanism, not actual cash custody, legal debt or settlement.

**Evidence:**

- [Repository](https://github.com/ehsanisildur-ux/rank-clear)
- [GenLayer contract source](https://github.com/ehsanisildur-ux/rank-clear/blob/main/contracts/rank_clear.py)
- [GenLayer contract explorer](https://explorer-studio.genlayer.com/address/0xD98E26688B3BF7753a032DB8Af06aBA54CDDcaCf)
- [Deployment transaction](https://explorer-studio.genlayer.com/tx/0x1a1272089eab7dd3960f106e0570d977d9732578e42f2ad4a6ba1b65bf780d53)
- [All scenario proofs](https://github.com/ehsanisildur-ux/rank-clear/blob/main/proofs/README.md)
- [Passing tests and live proof workflow](https://github.com/ehsanisildur-ux/rank-clear/actions/runs/40172820719)
