/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Inbox } from '@/types/Inbox';
import { camelCase } from './camelCase';

export const transformInbox = (inbox: any): Inbox => {
  return camelCase(inbox, { deep: true }) as unknown as Inbox;
};
