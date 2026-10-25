from copy import deepcopy
from itertools import product
import random
import pytest
from support import F, ORDER, FIRMS, answer


def fixed_points(cash, claims, order):
    # Independent exhaustive feasibility oracle: no endpoint iteration or contract F().
    cells = [(i, j) for i in range(3) for j in range(4) if i != j and claims[i][j]]
    found = []
    for amounts in product(*(range(claims[i][j] + 1) for i, j in cells)):
        p = [[0] * 4 for _ in range(3)]
        for (i, j), amount in zip(cells, amounts): p[i][j] = amount
        valid = True
        for i in range(3):
            funds = cash[i] + sum(p[k][i] for k in range(3))
            for j in order[i]:
                required = min(funds, claims[i][j])
                if p[i][j] != required:
                    valid = False
                    break
                funds -= required
            if not valid: break
        if valid: found.append(p)
    return found


def check(cash, claims, order=ORDER, enumerate_points=True):
    r = F['envelope'](cash, claims, order)
    if enumerate_points:
        points = fixed_points(cash, claims, order)
        assert points
        for endpoint, choose in [('least', min), ('greatest', max)]:
            expected = [[choose(p[i][j] for p in points) for j in range(4)] for i in range(3)]
            assert r[endpoint]['payments'] == expected
            assert expected in points
        assert (r['status'] == 'UNIQUE') == (len(points) == 1)
    for endpoint in ['least', 'greatest']:
        e = r[endpoint]
        assert sum(e['equity']) + e['outside_recovery'] == sum(cash)
        assert all(x >= 0 for x in e['equity'])
        for i in range(3):
            assert e['payments'][i][i] == 0
            assert all(0 <= a <= b for a, b in zip(e['payments'][i], claims[i]))
        assert len(e['trace']) <= sum(map(sum, claims)) + 1
        assert F['waterfall'](cash, claims, order, e['payments']) == e['payments']
        for before, after in zip(e['trace'], e['trace'][1:]):
            assert F['waterfall'](cash, claims, order, before) == after
            assert all((a >= b if endpoint == 'greatest' else a <= b) for row, following in zip(before, after) for a, b in zip(row, following))
    return r


@pytest.mark.parametrize('bits', range(512))
def test_all_binary_claims_all_binary_cash(bits):
    cells = [(i, j) for i in range(3) for j in range(4) if i != j]
    claims = [[0] * 4 for _ in range(3)]
    for k, (i, j) in enumerate(cells): claims[i][j] = (bits >> k) & 1
    for cash in product(range(2), repeat=3): check(list(cash), claims)


def test_junior_outside_order_against_enumeration():
    order = [[j for j in range(3) if j != i] + [3] for i in range(3)]
    for bits in range(512):
        claims = [[0] * 4 for _ in range(3)]
        for k, (i, j) in enumerate((i, j) for i in range(3) for j in range(4) if i != j):
            claims[i][j] = (bits >> k) & 1
        for cash in ([0, 0, 0], [1, 0, 1]): check(cash, claims, order)


def test_generated_larger_integer_claims():
    rng = random.Random(1981)
    for _ in range(120):
        claims = [[0 if i == j else rng.randrange(3) for j in range(4)] for i in range(3)]
        cash = [rng.randrange(5) for _ in range(3)]
        order = deepcopy(ORDER)
        for row in order: rng.shuffle(row)
        check(cash, claims, order)


def test_closed_cycle_has_five_fixed_points_and_distinct_bounds():
    p = [[0, 4, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0]]
    r = check([0, 0, 0], p)
    assert len(fixed_points([0, 0, 0], p, ORDER)) == 5
    assert r['status'] == 'MULTIPLE'
    assert r['least']['payments'] == [[0] * 4 for _ in range(3)]
    assert r['greatest']['payments'] == p
    assert r['possible_defaults'] == [True, True, False]
    assert r['definite_defaults'] == [False, False, False]
    rescued = check([1, 0, 0], p)
    assert rescued['status'] == 'UNIQUE'
    assert rescued['least']['payments'] == p
    assert rescued['least']['equity'] == [1, 0, 0]


def test_waterfall_not_proportional_and_order_is_consequential():
    p = [[0, 2, 0, 2], [0, 0, 0, 3], [0, 0, 0, 0]]
    senior = check([3, 0, 0], p)
    junior = check([3, 0, 0], p, [[1, 2, 3], [0, 2, 3], [0, 1, 3]])
    assert senior['least']['payments'][0] == [0, 1, 0, 2]
    assert junior['least']['payments'][0] == [0, 2, 0, 1]
    assert senior['least']['payments'][1][3] == 1
    assert junior['least']['payments'][1][3] == 2


def test_zero_claims_and_large_cash_leave_equity():
    r = check([16, 8, 0], [[0] * 4 for _ in range(3)])
    assert r['status'] == 'UNIQUE'
    assert r['least']['equity'] == [16, 8, 0]
    assert r['definite_defaults'] == [False] * 3


@pytest.mark.parametrize('case', ['chain', 'cycle', 'priority', 'review'])
def test_unknown_blocks_all_clearing(case):
    a = answer(case)
    for position in range(12):
        b = deepcopy(a)
        cell = b['cash'][position] if position < 3 else b['claims'][(position - 3) // 3][(position - 3) % 3]
        cell['value'] = 'UNKNOWN'
        r = F['compile_assessment'](b, ORDER)
        assert r['status'] == 'REVIEW' and r['unknown']
        assert 'least' not in r


def test_injections_never_reduce_either_payment_endpoint():
    rng = random.Random(912)
    for _ in range(80):
        claims = [[0 if i == j else rng.randrange(9) for j in range(4)] for i in range(3)]
        cash = [rng.randrange(9) for _ in range(3)]
        before = check(cash, claims, enumerate_points=False)
        for firm in range(3):
            after_cash = list(cash)
            after_cash[firm] += 8
            after = check(after_cash, claims, enumerate_points=False)
            for name in ['least', 'greatest']:
                assert all(a <= b for row, following in zip(before[name]['payments'], after[name]['payments']) for a, b in zip(row, following))
