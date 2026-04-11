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

// Convert camelCase keys back to snake_case (e.g. "regNumber" -> "reg_number",
// "addressLine1" -> "address_line_1") since the mobile app camelCases all API
// responses but templates use snake_case keys.
const toSnakeCase = (str: string) =>
  str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([a-zA-Z])(\d)/g, '$1_$2')
    .replace(/(\d)([a-zA-Z])/g, '$1_$2')
    .toLowerCase();

const toSnakeCaseKeys = (obj: Record<string, string>): Record<string, string> =>
  Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[toSnakeCase(key)] = value;
    return acc;
  }, {});

export const allMessageVariables = ({ conversation }: { conversation: Conversation }) => {
  if (!conversation) return {};
  const contact = conversation?.meta?.sender as Contact;
  // @chatwoot/utils expects snake_case keys, but the mobile app camelCases all API responses.
  // Convert the relevant fields back to snake_case before passing them to getMessageVariables.
  const conversationCustomAttrs = toSnakeCaseKeys(conversation.customAttributes ?? {});
  const contactCustomAttrs = toSnakeCaseKeys(contact?.customAttributes ?? {});
  const snakeCaseConversation = {
    ...conversation,
    custom_attributes: conversationCustomAttrs,
    meta: {
      ...conversation.meta,
      sender: contact
        ? {
            ...contact,
            phone_number: contact.phoneNumber,
            custom_attributes: contactCustomAttrs,
          }
        : conversation.meta.sender,
      assignee: conversation.meta.assignee
        ? {
            ...conversation.meta.assignee,
          }
        : undefined,
    },
  };
  const snakeCaseContact = contact
    ? {
        ...contact,
        phone_number: contact.phoneNumber,
        custom_attributes: contactCustomAttrs,
      }
    : undefined;
  return getMessageVariables({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    conversation: snakeCaseConversation,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    contact: snakeCaseContact,
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
