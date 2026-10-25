import json
import subprocess
import pytest
from support import ROOT, PRIORITIES, deploy, ingest


@pytest.mark.parametrize('case', ['chain', 'cycle', 'priority', 'review'])
def test_actual_direct_vm_against_live_javascript_enumerator(direct_vm, direct_deploy, case):
    priorities = [[x for x in ['amber', 'bronze', 'jade', 'outside'] if x != f] for f in ['amber', 'bronze', 'jade']] if case == 'priority' else PRIORITIES
    c = deploy(direct_deploy, priorities=priorities)
    ingest(c, direct_vm, case)
    queries = [] if case == 'review' else [c.stress(0, firm, extra) for firm in range(3) for extra in [0, 1, 4, 8]]
    out = subprocess.run(['node', 'scripts/check-local-trace.cjs'], cwd=ROOT, input=json.dumps({'id': case, 'state': c.get_state(), 'queries': queries}), text=True, capture_output=True)
    assert out.returncode == 0, out.stdout + out.stderr
