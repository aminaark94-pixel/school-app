import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio, DEFAULT_COLORS } from '../src/lib/theme';

test('Ideas is the default and core text pairs meet WCAG AA', () => {
  assert.equal(DEFAULT_COLORS.primary, '#0C1F38');
  assert.equal(DEFAULT_COLORS.accent, '#F02434');
  assert.equal(DEFAULT_COLORS.bg, '#EDF2F7');
  for (const [fg, bg] of [
    ['#FFFFFF', DEFAULT_COLORS.primary],
    [DEFAULT_COLORS.ink, DEFAULT_COLORS.bg],
    ['#415166', '#FFFFFF'],
    ['#14532D', '#DCFCE7'],
    ['#78350F', '#FEF3C7'],
    ['#991B1B', '#FEE2E2'],
  ]) assert.ok(contrastRatio(fg, bg) >= 4.5, `${fg} on ${bg}`);
});
