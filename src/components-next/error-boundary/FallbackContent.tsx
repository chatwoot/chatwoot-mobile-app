import { IOS_DESIGN } from '@/utils';
import { SplitFallback } from './SplitFallback';
import { PhoneFallback } from './PhoneFallback';

export type FallbackProps = {
  resetError: () => void;
};

export const FallbackContent = ({ resetError }: FallbackProps) =>
  IOS_DESIGN ? (
    <SplitFallback resetError={resetError} />
  ) : (
    <PhoneFallback resetError={resetError} />
  );
