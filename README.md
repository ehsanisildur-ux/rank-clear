# RankClear

Standalone GenLayer seniority clearing envelopes from independently interpreted financial scenario statements. Full fetched prose supplies external cash and due claims; exact validator agreement drives least/greatest integer waterfall fixed points, default bounds and cash-injection stress queries.

Read [architecture and limits](docs/architecture.md), [pinned contract](contracts/rank_clear.py), [synthetic statements](statements) and [tests](tests/direct). The oracle records publisher-declared scenarios. It does not custody cash, discharge legal debts or certify service delivery.

## Local checks

```sh
pip install -r requirements-dev.txt
genvm-lint download --version v0.2.16
genvm-lint check contracts/rank_clear.py --json
python -m pytest tests/direct -q
node --test tests/rpc-preflight.test.cjs
```

Classical clearing fixed-point ideas are credited in the architecture. Generic CLI transport code retains its original MIT attribution; the contract and clearing tests are new.

## Verified StudioNet deployment

[Primary contract explorer](https://explorer-studio.genlayer.com/address/0xD98E26688B3BF7753a032DB8Af06aBA54CDDcaCf) · [20 finalized scenario receipts](proofs/README.md) · [Ready submission text](docs/submission.md).

GenVM lint, 598 direct tests and seven transport tests pass. Four live suites include eight successes, twelve exact expected rejections and 36 independently checked stress views. Full source, signatures, votes and final state match fresh onchain reads.
