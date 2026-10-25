import ast
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'contracts/rank_clear.py'
REPO = 'ehsanisildur-ux/rank-clear'
FIRMS = ['amber', 'bronze', 'jade']
PRIORITIES = [['outside'] + [x for x in FIRMS if x != f] for f in FIRMS]


def pure():
    names = {'integer', 'creditors', 'values', 'valid_assessment', 'waterfall', 'endpoint', 'envelope', 'compile_assessment'}
    tree = ast.parse(SOURCE.read_text())
    def fail(message): raise AssertionError(message)
    ns = {'json': json, 'FIRMS': FIRMS, 'OUTSIDE': 'outside', 'fail': fail}
    exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in names], type_ignores=[]), str(SOURCE), 'exec'), ns)
    return ns


F = pure()
ORDER = [[3] + [j for j in range(3) if j != i] for i in range(3)]


def record(case='chain', restated=False):
    name = case + ('-restated' if restated else '')
    raw = (ROOT / 'statements' / (name + '.json')).read_bytes()
    return 'https://raw.githubusercontent.com/' + REPO + '/' + 'a' * 40 + '/statements/' + name + '.json', hashlib.sha256(raw).hexdigest(), raw


def answer(case='chain', restated=False):
    out = json.loads((ROOT / 'tests' / (case + '-expected.json')).read_text())
    source = json.loads(record(case, restated)[2])
    for i, row in enumerate(source['firms']):
        out['cash'][i]['quote'] = row['cash']
        for cell, claim in zip(out['claims'][i], row['claims']): cell['quote'] = claim['text']
    return out


def deploy(factory, **kwargs):
    params = {'repository': REPO, 'priorities': PRIORITIES}
    params.update(kwargs)
    return factory(str(SOURCE), **params)


def mocks(vm, case='chain', proposed=None, audit=None, raw=None, status=200, restated=False):
    vm.clear_mocks()
    url, sha, source = record(case, restated)
    vm.mock_web(re.escape(url), {'status': status, 'body': source if raw is None else raw})
    vm.mock_llm(r'.*RANKCLEAR-EXTRACT.*', json.dumps(answer(case, restated) if proposed is None else proposed))
    vm.mock_llm(r'.*RANKCLEAR-AUDIT.*', json.dumps({'cash': [True] * 3, 'claims': [[True] * 3 for _ in range(3)]} if audit is None else audit))


def ingest(c, vm, case='chain'):
    mocks(vm, case)
    c.ingest(*record(case)[:2])
    assert vm.run_validator() is True
    return c.get_state()['snapshots'][-1]
