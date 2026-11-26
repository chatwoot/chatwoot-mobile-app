import { commonLabels, toggleLabel } from './labelSelection';

it('selects only labels shared by all selected conversations', () => {
  expect(commonLabels([{ labels: ['sales', 'vip'] }, { labels: ['sales', 'support'] }])).toEqual([
    'sales',
  ]);
  expect(commonLabels([{ labels: ['vip'] }])).toEqual(['vip']);
  expect(commonLabels([])).toEqual([]);
});

it('removes a checked label and adds it again on the next tap', () => {
  const removed = toggleLabel(['sales', 'vip'], 'sales');
  expect(removed).toEqual({ selected: ['vip'], action: { remove: ['sales'] } });
  expect(toggleLabel(removed.selected, 'sales')).toEqual({
    selected: ['vip', 'sales'],
    action: { add: ['sales'] },
  });
});
