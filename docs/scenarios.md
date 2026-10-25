# Synthetic proof scenarios

All amounts are abstract clearing-units; these records do not assert real debts or funds.

| Scenario | Mechanism exercised | Required result |
|---|---|---|
| chain | Amber has cash 2, owes outside 1 and Bronze 4; Bronze owes outside 1 and Jade 4; Jade owes outside 3. Outside is senior. | UNIQUE payments Amber→outside 1, Amber→Bronze 1, Bronze→outside 1. Jade receives nothing. Defaults propagate beyond the cash-poor origin. |
| cycle | Amber and Bronze owe each other 4, with no external cash or outside claims. | MULTIPLE: least payments zero, greatest bilateral payments four. Five exact fixed points exist; the greatest is not a claim of prefunded liquidity. Injecting one external unit into Amber or Bronze yields a unique fully paid cycle. |
| priority | Amber has cash 3 and owes Bronze 2 and outside 2. Bronze owes outside 3. Inter-firm claims are senior to outside in this instance. | UNIQUE Amber→Bronze 2, Amber→outside 1, Bronze→outside 2. With outside senior, the same statement would give Bronze only 1. |
| review | Amber's final available cash is unresolved between two and three; claims remain definite. | REVIEW with cash:amber unresolved; no clearing vectors, no stress calculation. Missing amounts are never converted to zero. |

Each live suite deploys a fresh instance, rejects a wrong raw-byte commitment, accepts its full source, rejects an exact replay, and rejects a restatement with different bytes but the same snapshot ID. Every rejected write must preserve the complete snapshot state. Each known snapshot also gets twelve read-only stress checks: each of three firms receives hypothetical extra cash 0, 1, 4 or 8. The view changes no stored values.

The Python tests enumerate every fixed point for 5,120 small binary configurations and 120 generated larger configurations, with two distinct priority policies. They check sharp endpoint matrices, multiplicity, limited liability, seniority, monotone traces and conservation. Four actual direct-VM snapshots and their stress grids must also match the separate JavaScript enumerator used by the live verifier.
