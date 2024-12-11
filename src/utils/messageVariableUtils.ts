import { Conversation } from '@/types';
import { Contact } from '@/types';

import {
  getMessageVariables,
  replaceVariablesInMessage,
  getUndefinedVariablesInMessage,
} from '@chatwoot/utils';

type MessageVariables = {
  [key: string]: string | number | boolean;
};

export const allMessageVariables = ({ conversation }: { conversation: Conversation }) => {
  if (!conversation) return {};
  const contact = conversation?.meta?.sender as Contact;
  return getMessageVariables({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    conversation,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    contact,
  }) as MessageVariables;
};

export const replaceMessageVariables = ({
  message,
  variables,
}: {
  message: string;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  variables: MessageVariables;
}) => {
  return replaceVariablesInMessage({ message, variables });
};

export const getAllUndefinedVariablesInMessage = ({
  message,
  variables,
}: {
  message: string;
  variables: MessageVariables;
}) => {
  return getUndefinedVariablesInMessage({ message, variables });
};
