import { IOSEmailHead } from './IOSEmailHead';
import { DefaultEmailHead } from './DefaultEmailHead';

export type EmailMetaProps = {
  ccEmails: string;
  bccEmails: string;
  toEmails: string;
  onUpdateCC: (ccEmails: string) => void;
  onUpdateBCC: (bccEmails: string) => void;
  onUpdateTo: (toEmails: string) => void;
  iosStyle?: boolean;
  contactEmail?: string;
};

export const ReplyEmailHead = (props: EmailMetaProps) => {
  if (props.iosStyle) return <IOSEmailHead {...props} />;
  return <DefaultEmailHead {...props} />;
};
