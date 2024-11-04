export const cx = (...classNames: unknown[]): string => classNames.filter(Boolean).join(' ');
