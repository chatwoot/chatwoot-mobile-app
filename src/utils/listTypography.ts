import { IOS_DESIGN } from './common';

// iOS list row text (Apple HIG, Typography): iOS text-style sizes with tight leading for
// list rows. Letter spacing is left to the system font (see src/theme/tailwind.ts).
// Applied on iOS (IOS_DESIGN) and added after a row's own classes so these win; Android
// keeps its current styles.
// Sizes follow Apple's iOS text styles at the default text size (HIG, Typography).
export const IOS_LIST_TEXT = {
  // Row title: Headline (unread, semibold) / Body (read), 17/22.
  title: 'text-[17px] leading-[22px]',
  // Notification-style row title (Inbox): Subhead, 15/20, semibold when unread.
  notificationTitle: 'text-[15px] leading-[20px]',
  // Secondary line (message preview): Subhead, 15/20.
  body: 'text-[15px] leading-[20px]',
  // Trailing time: Subhead, 15/20.
  meta: 'text-[15px] leading-[20px]',
  // Supporting details (conversation ID, SLA, labels): Footnote, 13/18.
  footnote: 'text-[13px] leading-[18px]',
  // Unread count badge: Caption 1, 12/16.
  caption: 'text-[12px] leading-[16px]',
  // Unread rows get a heavier title so they stand out, like Mail and Messages.
  unreadTitle: 'font-inter-semibold-20',
  readTitle: 'font-inter-420-20',
};

/** True when list rows should use the iOS list text styles. */
export const useIOSListText = () => IOS_DESIGN;
