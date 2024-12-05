import camelcaseKeys from 'camelcase-keys';
import { Message } from '@/types';
import { getGroupedMessages } from '@/utils';
import { flatMap } from 'lodash';
// import { MESSAGE_LIST_1 } from './MessageList1';
// import { MESSAGE_LIST_2 } from './MessageList2';
import { MESSAGE_LIST_3 } from './MessageList3';

export const messagesListMockdata = {
  meta: {
    labels: [],
    additional_attributes: {
      browser: {
        device_name: 'Unknown',
        browser_name: 'Chrome',
        platform_name: 'macOS',
        browser_version: '119.0.0.0',
        platform_version: '10.15.7',
      },
      referer:
        'https://cdpn.io/cpe/boomboom/index.html?key=index.html-a53856e0-be6d-6a3b-1532-19b08d472acc',
      initiated_at: {
        timestamp: 'Tue Nov 28 2023 08:11:28 GMT+0530 (India Standard Time)',
      },
      browser_language: 'en',
    },
    contact: {
      additional_attributes: {
        city: '',
        country: '',
        description: '',
        company_name: '',
        country_code: '',
        social_profiles: {
          github: '',
          twitter: '',
          facebook: '',
          linkedin: '',
          instagram: '',
        },
      },
      custom_attributes: {},
      email: null,
      id: 1141,
      identifier: null,
      name: 'Merrile Petruk',
      phone_number: '',
      thumbnail: '',
      type: 'contact',
    },
    agent_last_seen_at: '2023-11-28T02:43:51.476Z',
    assignee_last_seen_at: null,
  },
  payload: [...MESSAGE_LIST_3],
};

const MESSAGES_LIST_MOCKDATA = [...messagesListMockdata.payload].reverse();

const messages = MESSAGES_LIST_MOCKDATA.map(
  value => camelcaseKeys(value, { deep: true }) as unknown as Message,
);

const groupedMessages = getGroupedMessages(messages);

const allMessages = flatMap(groupedMessages, section => [...section.data, { date: section.date }]);

export const ALL_MESSAGES_MOCKDATA = allMessages;
