import { format, formatDistanceToNow } from 'date-fns';

export const getElapsedTimeFromNow = (isoTimeString: string) => {
  try {
    const currentTime = new Date();
    const timeToFormat = new Date(isoTimeString);

    // @ts-ignore
    const lapsedTimeInSeconds = (currentTime - timeToFormat) / 1000;

    if (lapsedTimeInSeconds < 60) {
      return 'Now';
    } else if (lapsedTimeInSeconds < 3600) {
      const minutesAgo = Math.floor(lapsedTimeInSeconds / 60);
      return `${minutesAgo}m ago`;
    } else if (lapsedTimeInSeconds < 86400) {
      const hoursAgo = Math.floor(lapsedTimeInSeconds / 3600);
      if (hoursAgo <= 3) {
        return `${hoursAgo}h ago`;
      } else {
        // Use formatDistanceToNow to get relative time
        return formatDistanceToNow(timeToFormat, { addSuffix: true });
      }
    } else if (lapsedTimeInSeconds < 172800) {
      // 172800 seconds = 2 days
      return 'Yesterday';
    } else if (lapsedTimeInSeconds < 604800) {
      // 604800 seconds = 7 days (1 week)
      const daysAgo = Math.floor(lapsedTimeInSeconds / 86400);
      if (daysAgo === 1) {
        return 'Yesterday';
      } else {
        return format(timeToFormat, 'EEEE');
      }
    } else {
      // Beyond one week, return the date
      return format(timeToFormat, 'yyyy-MM-dd');
    }
  } catch (e) {
    console.log('%c⧭', 'color: #d0bfff', e);
  }
};
