import { getInboxIconByType } from '../inboxHelpers';

describe('getInboxIconByType', () => {
  it('should return the correct icon for the channel web', () => {
    const channelType = 'Channel::WebWidget';
    const result = getInboxIconByType({ channelType });
    expect(result).toEqual('globe-desktop-outline');
  });
  it('should return the correct icon for the channel facebook', () => {
    const channelType = 'Channel::FacebookPage';
    const result = getInboxIconByType({ channelType });
    expect(result).toEqual('brand-facebook');
  });
  it('should return the correct icon for channel twitter', () => {
    const channelType = 'Channel::TwitterProfile';
    const result = getInboxIconByType({ channelType });
    expect(result).toEqual('brand-twitter');
  });
  it('should return the correct icon for the channel twilio', () => {
    const channelType = 'Channel::TwilioSms';
    const result = getInboxIconByType({ channelType });
    expect(result).toEqual('brand-sms');
  });
});
