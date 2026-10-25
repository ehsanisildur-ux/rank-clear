# RankClear architecture

RankClear computes sharp clearing-payment bounds under fixed seniority waterfalls. Three firms owe integer clearing units to the other firms and an outside sink. Each firm distributes available cash plus incoming payments in its immutable creditor order, never above a claim. This produces a monotone map on a finite payment lattice. Iteration from zero reaches its least fixed point; iteration from nominal claims reaches its greatest. Different endpoints expose circular-payment ambiguity instead of concealing it behind an arbitrary solver seed.

## Consensus boundary

User action → commit-pinned publisher statement → independently fetched full bytes and SHA-256 → exact consensus on each available-cash and currently-due claim amount → deterministic clearing envelope → immutable snapshot and read-only injection analysis.

The contract fixes the repository and all creditor priorities. Anyone can ingest up to six distinct snapshots; nobody supplies an authoritative numerical matrix or edits a recorded result. Each source must contain the complete fixed firm/creditor roster. The leader extracts all twelve quantities from prose. Validators fetch the source themselves, independently extract each integer or UNKNOWN, compare every quantity exactly, and audit all proposed excerpts against the complete statement. Unknown cash or claims prevent all clearing and stress calculations for that snapshot. Fetch, hash, schema or model failures do not consume a slot.

Available external cash excludes receivables, promised injections and unused credit lines. Claims mean outstanding amounts due in this clearing, after explicit repayment, forgiveness and corrections. Zero must be established, not inferred from missing information. Values outside 0–8 or conditional/unresolved values are UNKNOWN. Firm identity, snapshot and common unit are fixed by the source schema. The publisher is authoritative only about its declared scenario, not real-world cash custody or legal debt.

## Clearing and bounds

For payment matrix P, available_i = cash_i + sum_j P[j,i]. F(P)[i] fills creditor claims in the configured order using that availability; self-payments are always zero, and outside never pays back. Both endpoint sequences are componentwise monotone. Every strict step changes an integer coordinate; sum(claims) bounds strict iterations. A final F(P)=P check is mandatory. Every fixed point lies between the two endpoints. Both endpoints themselves are fixed points, so each individual payment bound is sharp. These are not independently combinable bounds or an enumeration of all intermediate fixed points.

The least endpoint is constructible by repeated clearing from no payments. The greatest endpoint may rely on circular simultaneous book entries and is not a claim of prefunded liquidity. Senior claims receive funds before junior claims at both endpoints. Equity is cash plus incoming minus outgoing; external recovery plus total equity equals total external cash. A firm definitely defaults if its greatest outgoing payment is below nominal debt; it possibly defaults if its least payment is below nominal debt. Zero-debt firms do not default.

`stress(snapshot, firm, extra)` adds 0–8 hypothetical external units to exactly one firm and recomputes both endpoints. It changes no stored balances or claims. It is a bounded what-if view, not a funding transaction, investment recommendation or rescue optimizer.

## Scope and originality

This is a new implementation of established fixed-point clearing ideas. It is distinct from balance-neutral cycle cancellation: claims are not canceled to minimize gross positions, external shortages propagate through seniority, and multiple clearing solutions are explicitly preserved. It has no owner-controlled graph proposals, version approvals, service certificates, token mint, redemption or legal discharge. It does not transfer assets or verify service delivery. Synthetic fixtures demonstrate semantic interpretation and clearing mechanics.

Three firms, nine claims of at most eight units, finite monotone iteration and six snapshots bound storage and work. Permissionless ingestion can fill the bounded log; deploy separate instances or restrict the publisher repository operationally where that matters. Source text is untrusted model data. Repository ownership and pinned hashes establish byte provenance, not publisher honesty. No override or source replacement exists.

## References

- [Csóka and Herings, Uniqueness of Clearing Payment Matrices in Financial Networks](https://pubsonline.informs.org/doi/10.1287/moor.2023.1354): least/greatest clearing matrices and the significance of priorities for multiplicity. RankClear uses its explicitly defined bounded integer waterfall, not the continuous proportional Eisenberg–Noe algorithm.
- [GenLayer equivalence principle](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle): independent validator acquisition and substantive comparison.
