import { PathProps } from 'react-native-svg';

import { AllStatusTypes, AssigneeTypes, SortTypes } from './common';

export * from './Agent';
export * from './AgentBot';
export * from './common';
export * from './Contact';
export * from './Conversation';
export * from './Message';
export * from './Team';
export * from './Account';
export * from './Macro';

export type IconProps = PathProps;

export interface GenericListType {
  key?: string;
  title?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  subtitleType?: 'dark' | 'light';
  hasChevron?: boolean;
  disabled?: boolean;
  link?: string;
  onPressListItem?: (key?: string) => void;
  actions?: {
    actionName: string;
    actionParams: string[];
  }[];
}

export interface AttributeListType {
  key?: string;
  title?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  subtitleType?: 'dark' | 'light';
  hasChevron?: boolean;
  disabled?: boolean;
  type: 'text' | 'date' | 'checkbox' | 'link';
}

/**
 * The types of Filter for Conversation List
 */

export type ConversationFilterOptions = 'assignee_type' | 'status' | 'sort_by' | 'inbox_id';

// Defining the specific options for each filter type
export type AssigneeFilterOptions = Record<AssigneeTypes, string>;
export type StatusFilterOptions = Record<AllStatusTypes, string>;
export type SortFilterOptions = Record<SortTypes, string>;

export type FilterOption<T extends ConversationFilterOptions> = {
  type: T;
  options: T extends 'assignee_type'
    ? AssigneeFilterOptions
    : T extends 'status'
      ? StatusFilterOptions
      : T extends 'sort_by'
        ? SortFilterOptions
        : T extends 'inbox_id'
          ? Record<number, string>
          : never;
  defaultFilter: string;
};

export type LabelType = { labelText: string; labelColor: string };

export type RenderPropType<T = unknown> =
  | React.ReactNode
  | ((args: T) => JSX.Element | React.ReactNode);
