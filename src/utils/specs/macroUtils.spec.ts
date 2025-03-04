import {
  emptyMacro,
  resolveActionName,
  resolveLabels,
  resolveTeamIds,
  getFileName,
  resolveAgents,
  MACRO_ACTION_TYPES,
} from '../macroUtils';
import { teams, labels, files, agents } from './macroFixtures';

describe('#emptyMacro', () => {
  const defaultMacro = {
    name: '',
    actions: [
      {
        action_name: 'assign_team',
        action_params: [],
      },
    ],
    visibility: 'global',
  };
  it('returns the default macro', () => {
    expect(emptyMacro).toEqual(defaultMacro);
  });
});

describe('#resolveActionName', () => {
  it('resolve action name from key and return the correct label', () => {
    expect(resolveActionName(MACRO_ACTION_TYPES[0].key)).toEqual(MACRO_ACTION_TYPES[0].label);
    expect(resolveActionName(MACRO_ACTION_TYPES[1].key)).toEqual(MACRO_ACTION_TYPES[1].label);
    expect(resolveActionName(MACRO_ACTION_TYPES[1].key)).not.toEqual(MACRO_ACTION_TYPES[0].label);
    expect(resolveActionName('change_priority')).toEqual('Change Priority');
  });

  it('returns empty string for non-existent action key', () => {
    expect(resolveActionName('non_existent_key')).toEqual('');
  });
});

describe('#resolveTeamIds', () => {
  it('resolves team names from ids, and returns a joined string', () => {
    const resolvedTeams = 'sales team, engineering team';
    expect(resolveTeamIds(teams, [1, 2])).toEqual(resolvedTeams);
  });

  it('handles empty teams array', () => {
    expect(resolveTeamIds([], [1, 2])).toEqual(', ');
  });

  it('handles non-existent team ids', () => {
    expect(resolveTeamIds(teams, [999])).toEqual('');
  });

  it('handles empty ids array', () => {
    expect(resolveTeamIds(teams, [])).toEqual('');
  });
});

describe('#resolveLabels', () => {
  it('resolves labels names from ids and returns a joined string', () => {
    const resolvedLabels = 'sales, billing';
    expect(resolveLabels(labels, ['sales', 'billing'])).toEqual(resolvedLabels);
  });

  it('handles empty labels array', () => {
    expect(resolveLabels([], ['sales', 'billing'])).toEqual(', ');
  });

  it('handles non-existent label ids', () => {
    expect(resolveLabels(labels, ['non-existent'])).toEqual('');
  });

  it('handles empty ids array', () => {
    expect(resolveLabels(labels, [])).toEqual('');
  });
});

describe('#resolveAgents', () => {
  it('resolves agents names from ids and returns a joined string', () => {
    const resolvedAgents = 'John Doe';
    expect(resolveAgents(agents, [1])).toEqual(resolvedAgents);
  });

  it('handles multiple agent ids', () => {
    const resolvedAgents = 'John Doe, Clark Kent';
    expect(resolveAgents(agents, [1, 9])).toEqual(resolvedAgents);
  });

  it('handles empty agents array', () => {
    expect(resolveAgents([], [1])).toEqual('');
  });

  it('handles non-existent agent ids', () => {
    expect(resolveAgents(agents, [999])).toEqual('');
  });

  it('handles empty ids array', () => {
    expect(resolveAgents(agents, [])).toEqual('');
  });
});

describe('#getFileName', () => {
  it('returns the correct file name from the list of files', () => {
    expect(getFileName(files[0].blob_id, 'send_attachment', files)).toEqual(files[0].filename);
    expect(getFileName(files[1].blob_id, 'send_attachment', files)).toEqual(files[1].filename);
    expect(getFileName(files[0].blob_id, 'wrong_action', files)).toEqual('');
    expect(getFileName(files[0].blob_id, 'send_attachment', [])).toEqual('');
  });

  it('handles non-existent blob_id', () => {
    expect(getFileName(999, 'send_attachment', files)).toEqual('');
  });
});
