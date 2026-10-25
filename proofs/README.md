# RankClear — verified StudioNet proofs

Four independent instances on gasless StudioNet, chain **61999**. **20 FINALIZED / MAJORITY_AGREE receipts**: eight successful executions and twelve exact intentional rejections. Fresh verification checks all signed calldata, full source, complete final votes, unchanged rejection state and every final snapshot. **36 stress queries** match a separate exhaustive fixed-point oracle and fresh onchain reads.

Contract SHA-256: `b4fa809caa3dc5d695002ea704ccb73282d7dcc763db4481bd6e3c9aa7575858`. Fixture revision: `c83027ba49e5404498060f8526998adb435edd49`. Final source and deployment workflow revision: `e796ad28c2e6adf9e130a306f8daf712a6648acb`. Deployment calldata and current live code match these exact source bytes.

| Scenario | Contract explorer | Deployment | Semantic ingest | Recorded result |
|---|---|---|---|---|
| chain | [0xD98E26688B3BF7753a032DB8Af06aBA54CDDcaCf](https://explorer-studio.genlayer.com/address/0xD98E26688B3BF7753a032DB8Af06aBA54CDDcaCf) | [deploy](https://explorer-studio.genlayer.com/tx/0x1a1272089eab7dd3960f106e0570d977d9732578e42f2ad4a6ba1b65bf780d53) | [ingest](https://explorer-studio.genlayer.com/tx/0xf30f52dfeebc1a08f57faf0635450ca17eb93efbc056456296041b42b2e1549d) | UNIQUE; external cash shortage propagates through both downstream firms. |
| cycle | [0xE4a8e08bfae57eEe48F491DebAcabd17A907CfA8](https://explorer-studio.genlayer.com/address/0xE4a8e08bfae57eEe48F491DebAcabd17A907CfA8) | [deploy](https://explorer-studio.genlayer.com/tx/0xe983402342d4fb5997cb514f82d7a046165bfc23773994e86127e00f3c1c4b41) | [ingest](https://explorer-studio.genlayer.com/tx/0x9ba0d5fa1cdd68167a0b0c32554d1a061435960fdeabdf5e5b6cd9af81c6ba30) | MULTIPLE; least bilateral payments 0, greatest 4; one-unit injection into Amber or Bronze removes the ambiguity. |
| priority | [0x47dA18849B840Dc06816bd99d2A5377f537F0511](https://explorer-studio.genlayer.com/address/0x47dA18849B840Dc06816bd99d2A5377f537F0511) | [deploy](https://explorer-studio.genlayer.com/tx/0x81d4bcf4120e78dfcae8996a996b272777b7f4ff3e05fbfb3d092647ec8f8653) | [ingest](https://explorer-studio.genlayer.com/tx/0x19adec996af21d865eba96aecc09074789f52b2cd4ecf708f6cf9afa9761cdb5) | UNIQUE; Bronze receives 2 ahead of junior outside claim, changing downstream recovery. |
| review | [0xbBf4b21502Fb1aA37aC31016a7f6d86F1bE5C0fF](https://explorer-studio.genlayer.com/address/0xbBf4b21502Fb1aA37aC31016a7f6d86F1bE5C0fF) | [deploy](https://explorer-studio.genlayer.com/tx/0xf96be68c966ba26348338506b84b1316638546a79da0b3f3020e0979fa9848ae) | [ingest](https://explorer-studio.genlayer.com/tx/0xfcd932008633cc6c06e48ea6167dfa0528cee7e61aa2ccc3477555183fd909ac) | REVIEW; unresolved Amber cash, no clearing calculation or stress result. |

## Full receipt journal

Each scenario proves a wrong raw-byte commitment fails, a correct full statement is accepted, its exact replay fails, and a differently worded restatement of the same snapshot ID fails. Every rejection preserves the complete configuration and snapshot log. Lifecycle finality is checked separately from execution success.

Recorded dissent: review-ingest (3 agree / 1 disagree / 1 idle); review-reject-restated (3 agree / 1 disagree / 1 idle). These passed by strict majority, not unanimity.

Full JSON receipts preserve rotations and earlier rounds as well as the final votes below.

| Call | Transaction | Execution | Agree | Disagree | Idle |
|---|---|---|---:|---:|---:|
| chain-deployment | [tx](https://explorer-studio.genlayer.com/tx/0x1a1272089eab7dd3960f106e0570d977d9732578e42f2ad4a6ba1b65bf780d53) | SUCCESS | 3 | 0 | 2 |
| chain-reject-hash | [tx](https://explorer-studio.genlayer.com/tx/0x01aaa282bc26fb3b10431d444eb55431319665f6589dbc68acc4968655009047) | ERROR | 3 | 0 | 2 |
| chain-ingest | [tx](https://explorer-studio.genlayer.com/tx/0xf30f52dfeebc1a08f57faf0635450ca17eb93efbc056456296041b42b2e1549d) | SUCCESS | 3 | 0 | 2 |
| chain-reject-replay | [tx](https://explorer-studio.genlayer.com/tx/0x288a6c48f05aaff257460ad3c3133dbc4dec9c1c0e811e2199d0158b78cea461) | ERROR | 3 | 0 | 2 |
| chain-reject-restated | [tx](https://explorer-studio.genlayer.com/tx/0x52848d046e6cb6db17b007d3f5b5cc76b26a30cb9f82482b5627c06813891768) | ERROR | 3 | 0 | 2 |
| cycle-deployment | [tx](https://explorer-studio.genlayer.com/tx/0xe983402342d4fb5997cb514f82d7a046165bfc23773994e86127e00f3c1c4b41) | SUCCESS | 3 | 0 | 2 |
| cycle-reject-hash | [tx](https://explorer-studio.genlayer.com/tx/0x24fbc712a9cd9f1ac9e21bedf60c9bb4bb500033a1366706bbdca806ea270b23) | ERROR | 3 | 0 | 2 |
| cycle-ingest | [tx](https://explorer-studio.genlayer.com/tx/0x9ba0d5fa1cdd68167a0b0c32554d1a061435960fdeabdf5e5b6cd9af81c6ba30) | SUCCESS | 3 | 0 | 2 |
| cycle-reject-replay | [tx](https://explorer-studio.genlayer.com/tx/0x657ccf691d45046437c6c376c3118a26e5a8b9fddb720f2bef81ea7df91cb078) | ERROR | 4 | 0 | 1 |
| cycle-reject-restated | [tx](https://explorer-studio.genlayer.com/tx/0x96b4a406982b6656ebba734b7a32347d01e6e9971a2d9962f08f513200c26118) | ERROR | 3 | 0 | 2 |
| priority-deployment | [tx](https://explorer-studio.genlayer.com/tx/0x81d4bcf4120e78dfcae8996a996b272777b7f4ff3e05fbfb3d092647ec8f8653) | SUCCESS | 3 | 0 | 2 |
| priority-reject-hash | [tx](https://explorer-studio.genlayer.com/tx/0xbe89792b19d5710795ac0634283c258cce6f2f42ac2ff218f17780e1bbceb5db) | ERROR | 3 | 0 | 2 |
| priority-ingest | [tx](https://explorer-studio.genlayer.com/tx/0x19adec996af21d865eba96aecc09074789f52b2cd4ecf708f6cf9afa9761cdb5) | SUCCESS | 3 | 0 | 2 |
| priority-reject-replay | [tx](https://explorer-studio.genlayer.com/tx/0xada835be26d782363a890e270031b1c367d21546ec825107c5e2458737249974) | ERROR | 3 | 0 | 2 |
| priority-reject-restated | [tx](https://explorer-studio.genlayer.com/tx/0x7e0a921a7c7a0fc494b49baa97fd7bab786d9d91c18c392fb073c76af9a06a27) | ERROR | 3 | 0 | 2 |
| review-deployment | [tx](https://explorer-studio.genlayer.com/tx/0xf96be68c966ba26348338506b84b1316638546a79da0b3f3020e0979fa9848ae) | SUCCESS | 3 | 0 | 2 |
| review-reject-hash | [tx](https://explorer-studio.genlayer.com/tx/0xf17050bb2ed3ce1fc6f6d093c9a07a2d5a8a1c819dd7dfbd60cac60451f2472c) | ERROR | 3 | 0 | 2 |
| review-ingest | [tx](https://explorer-studio.genlayer.com/tx/0xfcd932008633cc6c06e48ea6167dfa0528cee7e61aa2ccc3477555183fd909ac) | SUCCESS | 3 | 1 | 1 |
| review-reject-replay | [tx](https://explorer-studio.genlayer.com/tx/0xa29aa4c8848372baa406f0fbf24438efc5b6892d20d7857de1faf3e3895a52e9) | ERROR | 4 | 0 | 1 |
| review-reject-restated | [tx](https://explorer-studio.genlayer.com/tx/0x79c103e01532680b4a4186ca3d851858089e48a3dbac2983c9db9daa0c0867fe) | ERROR | 3 | 1 | 1 |

## Independent verification

The local offline verifier independently replayed all 20 receipts and exactly matched the four hosted fresh-verification reports. The merged report preserves each workflow's own verification time; merging did not perform another live check. An additional local fresh RPC attempt failed with `fetch failed`. The successful hosted checks remain the source of fresh receipt, code, complete-state and stress-view verification. See [offline replay](offline-verification.json), [hosted merge implementation](../scripts/summarize-hosted.cjs) and [GitHub artifact metadata](artifacts.json).

[Merged verification](verification.json) · [Signed transaction journal](transactions.json) · [Workflow provenance](provenance.json). Individual source/assessment states, full traces, stress grids and receipts are committed beside this page.

- [chain proof workflow](https://github.com/ehsanisildur-ux/rank-clear/actions/runs/40172820719) — [fresh summary](verification-chain.json), [598-test XML](chain-direct-tests.xml), [stress grid](chain-queries.json); fresh checked 2026-10-25T07:35:06.793Z.
- [cycle proof workflow](https://github.com/ehsanisildur-ux/rank-clear/actions/runs/40172824715) — [fresh summary](verification-cycle.json), [598-test XML](cycle-direct-tests.xml), [stress grid](cycle-queries.json); fresh checked 2026-10-25T07:34:52.549Z.
- [priority proof workflow](https://github.com/ehsanisildur-ux/rank-clear/actions/runs/40172828815) — [fresh summary](verification-priority.json), [598-test XML](priority-direct-tests.xml), [stress grid](priority-queries.json); fresh checked 2026-10-25T07:35:00.206Z.
- [review proof workflow](https://github.com/ehsanisildur-ux/rank-clear/actions/runs/40172832543) — [fresh summary](verification-review.json), [598-test XML](review-direct-tests.xml), [stress grid](review-queries.json); fresh checked 2026-10-25T07:34:26.551Z.

Local and hosted GenVM lint, **598 direct tests** and **seven transport tests** pass. The tests enumerate every feasible payment matrix for 5,120 binary configurations plus 120 generated larger configurations and compare their sharp bounds to the contract endpoints. Further tests check cash injection monotonicity, all twelve independent quantity disagreements, every audit position, UNKNOWN decisions, schema/hash/quote failures, source re-fetching, roster/priority bounds, append-only history and rejected-call rollback. Four actual direct-VM scenarios match the separate JavaScript enumerator and stress equation used by the live verifier.

The verifier checks exact constructor and method calldata, transaction sender and target, source bytes, unique hashes, complete voter membership and a strict majority, exact expected error bytes, every before/after state, full source-anchored extraction values, complete endpoint traces, priority allocation, conservation and every planned stress query. The JavaScript oracle independently enumerates fixed points rather than using the contract endpoint solver.

## Reproduce

Install locked tooling with `npm ci`; set `GENLAYER_CLI_PATH` to `node_modules/genlayer/dist/index.js`. Run `node scripts/verify-proofs.cjs --offline` for artifact checks. With a configured StudioNet CLI account in `RANK_ACCOUNT`, omit `--offline` to re-fetch transactions, code, final states and stress views. Both verifier modes are read-only. The workflow_dispatch scenarios deploy separate fresh instances with encrypted disposable accounts. A send whose transport outcome is ambiguous is never automatically replayed.

## Limits

These are synthetic publisher-declared financial scenarios, not authenticated balances, legal debts, settlement transactions or proof of service delivery. No assets move. The greatest clearing point can contain circular simultaneous payments and must not be described as prefunded liquidity. Both endpoint matrices are sharp individual bounds; arbitrary coordinate combinations need not be feasible. The contract uses its stated integer seniority waterfall, not proportional clearing. Stress injections are hypothetical views, not actual deposits or investment guidance. Review snapshots have no clearing vectors. See [architecture and assumptions](../docs/architecture.md) and [worked scenarios](../docs/scenarios.md).

## Earlier protocol failures — excluded

[Initial null protocol](history/protocol-v1/manifest.json) archives three successful older-source suites and a failed REVIEW ingest. [Diagnostic null protocol](history/protocol-v2/manifest.json) archives another failed REVIEW ingest; its stdout shows the UNKNOWN cash object without its value key even after repair. Both failed ingests finalized MAJORITY_DISAGREE and are unexpected failures, not intended rejections. The final protocol uses an explicit UNKNOWN string and still rejects missing keys, JSON null and independently disputed values. All 21 historical receipts are excluded from the 20 final-source primary receipts. Corrected suites use fresh disposable accounts and instances.
