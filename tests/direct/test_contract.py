from copy import deepcopy
import hashlib
import json
import pytest
from support import F, ORDER, PRIORITIES, deploy, ingest, mocks, record, answer


@pytest.mark.parametrize('case', ['chain', 'cycle', 'priority', 'review'])
def test_full_fetch_consensus_result_and_all_stresses(direct_vm, direct_deploy, case):
    c = deploy(direct_deploy)
    r = ingest(c, direct_vm, case)
    assert r['source'] == json.loads(record(case)[2])
    assert r['result'] == F['compile_assessment'](answer(case), ORDER)
    before = c.get_state()
    if case == 'review':
        with direct_vm.expect_revert('Unresolved snapshot'): c.stress(0, 0, 1)
    else:
        for firm in range(3):
            for extra in range(9):
                cash = list(r['result']['cash'])
                cash[firm] += extra
                assert c.stress(0, firm, extra)['result'] == F['envelope'](cash, r['result']['claims'], ORDER)
    assert c.get_state() == before


def test_permissionless_append_and_immutable_configuration(direct_vm, direct_deploy, direct_accounts):
    c = deploy(direct_deploy)
    direct_vm.sender = direct_accounts[1]
    a = ingest(c, direct_vm)
    direct_vm.sender = direct_accounts[2]
    ingest(c, direct_vm, 'cycle')
    state = c.get_state()
    assert state['snapshots'][0] == a
    assert state['configuration']['priorities'] == ORDER
    assert len(state['snapshots']) == 2


def test_duplicate_hash_rejected_before_external_calls(direct_vm, direct_deploy):
    c = deploy(direct_deploy)
    ingest(c, direct_vm)
    before = c.get_state()
    direct_vm.clear_mocks()
    with direct_vm.expect_revert('Statement already recorded'): c.ingest(*record()[:2])
    assert c.get_state() == before


def test_same_snapshot_different_bytes_rejected_after_consensus(direct_vm, direct_deploy):
    c = deploy(direct_deploy)
    ingest(c, direct_vm)
    before = c.get_state()
    mocks(direct_vm, restated=True)
    with direct_vm.expect_revert('Snapshot ID already recorded'): c.ingest(*record(restated=True)[:2])
    assert c.get_state() == before


@pytest.mark.parametrize('url', ['http://raw.githubusercontent.com/ehsanisildur-ux/rank-clear/' + 'a' * 40 + '/statements/chain.json',
    'https://example.com/chain.json', 'https://raw.githubusercontent.com/other/repo/' + 'a' * 40 + '/statements/chain.json',
    'https://raw.githubusercontent.com/ehsanisildur-ux/rank-clear/main/statements/chain.json',
    'https://raw.githubusercontent.com/ehsanisildur-ux/rank-clear/' + 'a' * 40 + '/statements/../chain.json'])
def test_wrong_source_scope(direct_vm, direct_deploy, url):
    c = deploy(direct_deploy)
    with direct_vm.expect_revert('Commit-pinned'): c.ingest(url, record()[1])
    assert c.get_state()['snapshots'] == []


@pytest.mark.parametrize('sha', ['', 'a' * 63, 'A' * 64, 'x' * 64])
def test_invalid_commitment(direct_vm, direct_deploy, sha):
    c = deploy(direct_deploy)
    with direct_vm.expect_revert('Commit-pinned'): c.ingest(record()[0], sha)


@pytest.mark.parametrize('repository', ['', '../bad', 'https://github.com/a/b', 'a/b/c'])
def test_invalid_repository(direct_vm, direct_deploy, repository):
    with direct_vm.expect_revert('Invalid repository'): deploy(direct_deploy, repository=repository)


@pytest.mark.parametrize('priorities', [[], PRIORITIES[:2], [['outside'] * 3] * 3, [['amber', 'bronze', 'outside']] * 3])
def test_invalid_priorities(direct_vm, direct_deploy, priorities):
    with direct_vm.expect_revert('required'): deploy(direct_deploy, priorities=priorities)


@pytest.mark.parametrize('snapshot,firm,extra', [(-1,0,0), (1,0,0), (0,-1,0), (0,3,0), (0,0,-1), (0,0,9)])
def test_invalid_stress_bounds(direct_vm, direct_deploy, snapshot, firm, extra):
    c = deploy(direct_deploy)
    ingest(c, direct_vm)
    with direct_vm.expect_revert('Invalid stress'): c.stress(snapshot, firm, extra)


@pytest.mark.parametrize('position', range(12))
def test_validator_independently_rejects_each_quantity_disagreement(direct_vm, direct_deploy, position):
    c = deploy(direct_deploy)
    ingest(c, direct_vm)
    changed = answer()
    cell = changed['cash'][position] if position < 3 else changed['claims'][(position - 3) // 3][(position - 3) % 3]
    cell['value'] = None if cell['value'] is not None else 0
    mocks(direct_vm, proposed=changed)
    assert direct_vm.run_validator() is False


@pytest.mark.parametrize('position', range(12))
def test_validator_substantive_audit_rejects_each_cell(direct_vm, direct_deploy, position):
    c = deploy(direct_deploy)
    ingest(c, direct_vm)
    a = {'cash': [True] * 3, 'claims': [[True] * 3 for _ in range(3)]}
    if position < 3: a['cash'][position] = False
    else: a['claims'][(position - 3) // 3][(position - 3) % 3] = False
    mocks(direct_vm, audit=a)
    assert direct_vm.run_validator() is False


def test_validator_fetches_real_source_not_just_leader_hash(direct_vm, direct_deploy):
    c = deploy(direct_deploy)
    ingest(c, direct_vm)
    mocks(direct_vm, raw=b'wrong bytes')
    assert direct_vm.run_validator() is False


@pytest.mark.parametrize('bad', [True, 1.0, '2', -1, 9])
def test_malformed_numeric_outputs_fail_without_append(direct_vm, direct_deploy, bad):
    c = deploy(direct_deploy)
    a = answer()
    a['cash'][0]['value'] = bad
    mocks(direct_vm, proposed=a)
    with direct_vm.expect_revert('Invalid complete quantities'): c.ingest(*record()[:2])
    assert c.get_state()['snapshots'] == []


@pytest.mark.parametrize('mutation', ['unit', 'roster', 'claim', 'duplicate', 'oversize', 'json'])
def test_external_schema_failure_rolls_back(direct_vm, direct_deploy, mutation):
    c = deploy(direct_deploy)
    source = json.loads(record()[2])
    if mutation == 'unit': source['unit'] = 'other'
    if mutation == 'roster': source['firms'].reverse()
    if mutation == 'claim': source['firms'][0]['claims'][0]['creditor'] = 'amber'
    raw = json.dumps(source).encode()
    if mutation == 'duplicate': raw = b'{"snapshot":"x","snapshot":"y"}'
    if mutation == 'oversize': raw = b'x' * 18001
    if mutation == 'json': raw = b'not json'
    mocks(direct_vm, raw=raw)
    with direct_vm.expect_revert('EXTERNAL'): c.ingest(record()[0], hashlib.sha256(raw).hexdigest())
    assert c.get_state()['snapshots'] == []


def test_wrong_hash_and_transient_error_not_consumed(direct_vm, direct_deploy):
    c = deploy(direct_deploy)
    mocks(direct_vm)
    with direct_vm.expect_revert('commitment mismatch'): c.ingest(record()[0], '0' * 64)
    mocks(direct_vm, status=503)
    with direct_vm.expect_revert('TRANSIENT'): c.ingest(*record()[:2])
    assert c.get_state()['snapshots'] == []


def test_missing_or_unanchored_quote_cannot_pass(direct_vm, direct_deploy):
    c = deploy(direct_deploy)
    a = answer()
    a['claims'][0][0]['quote'] = 'Fabricated passage that does not exist.'
    mocks(direct_vm, proposed=a)
    with direct_vm.expect_revert('Invalid complete quantities'): c.ingest(*record()[:2])


def test_six_snapshot_bound(direct_vm, direct_deploy):
    c = deploy(direct_deploy)
    for index in range(6):
        source = json.loads(record()[2])
        source['snapshot'] = 'case-' + str(index)
        raw = json.dumps(source).encode()
        mocks(direct_vm, raw=raw)
        c.ingest(record()[0], hashlib.sha256(raw).hexdigest())
    before = c.get_state()
    direct_vm.clear_mocks()
    with direct_vm.expect_revert('Snapshot log full'): c.ingest(*record()[:2])
    assert c.get_state() == before
