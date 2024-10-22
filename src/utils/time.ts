export const unixTimestampToReadableTime = (unixTimestamp: number) => {
  const date = new Date(unixTimestamp * 1000); // Convert Unix timestamp to milliseconds
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

  return `${formattedHours}:${minutes} ${ampm}`;
};
