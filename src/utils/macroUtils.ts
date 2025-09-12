import { Agent, Label, Team } from '@/types';

export const MACRO_ACTION_TYPES = [
  {
    key: 'assign_team',
    label: 'Assign a team',
    inputType: 'search_select',
  },
  {
    key: 'assign_agent',
    label: 'Assign an agent',
    inputType: 'search_select',
  },
  {
    key: 'add_label',
    label: 'Add a label',
    inputType: 'multi_select',
  },
  {
    key: 'remove_label',
    label: 'Remove a label',
    inputType: 'multi_select',
  },
  {
    key: 'remove_assigned_team',
    label: 'Remove Assigned Team',
    inputType: null,
  },
  {
    key: 'send_email_transcript',
    label: 'Send an email transcript',
    inputType: 'email',
  },
  {
    key: 'mute_conversation',
    label: 'Mute conversation',
    inputType: null,
  },
  {
    key: 'snooze_conversation',
    label: 'Snooze conversation',
    inputType: null,
  },
  {
    key: 'resolve_conversation',
    label: 'Resolve conversation',
    inputType: null,
  },
  {
    key: 'send_attachment',
    label: 'Send Attachment',
    inputType: 'attachment',
  },
  {
    key: 'send_message',
    label: 'Send a message',
    inputType: 'textarea',
  },
  {
    key: 'add_private_note',
    label: 'Add a private note',
    inputType: 'textarea',
  },
  {
    key: 'change_priority',
    label: 'Change Priority',
    inputType: 'search_select',
  },
];

type File = {
  id: number;
  blob_id: number;
  filename: string;
};

export const emptyMacro = {
  name: '',
  actions: [
    {
      action_name: 'assign_team',
      action_params: [],
    },
  ],
  visibility: 'global',
};

export const resolveActionName = (key: string) => {
  const action = MACRO_ACTION_TYPES.find(i => i.key === key);
  return action ? action.label : '';
};

export const resolveTeamIds = (teams: Team[], ids: number[]) => {
  return ids
    .map(id => {
      const team = teams.find(i => i.id === id);
      return team ? team.name : '';
    })
    .join(', ');
};

export const resolveLabels = (labels: Label[], ids: string[]) => {
  return ids
    .map(id => {
      const label = labels.find(i => i.title === id);
      return label ? label.title : '';
    })
    .join(', ');
};

export const resolveAgents = (agents: Agent[], ids: number[]) => {
  return ids
    .map(id => {
      const agent = agents.find(i => i.id === id);
      return agent ? agent.name : '';
    })
    .join(', ');
};

export const getFileName = (id: number, actionType: string, files: File[]) => {
  if (!id || !files) return '';
  if (actionType === 'send_attachment') {
    const file = files.find(item => item.blob_id === id);
    if (file) return file.filename.toString();
  }
  return '';
};
