import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { openURL } from '../urlUtils';
import { showToast } from '../toastUtils';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

jest.mock('../toastUtils', () => ({
  showToast: jest.fn(),
}));

const openBrowserAsync = WebBrowser.openBrowserAsync as jest.Mock;
const openSystemURL = jest.spyOn(Linking, 'openURL');

describe('openURL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    openBrowserAsync.mockResolvedValue(undefined);
    openSystemURL.mockResolvedValue(true);
  });

  it('opens a web URL in the in-app browser', async () => {
    await openURL({ URL: 'https://chatwoot.com' });

    expect(openBrowserAsync).toHaveBeenCalledWith('https://chatwoot.com');
    expect(openSystemURL).not.toHaveBeenCalled();
  });

  it('adds https to a scheme-less target', async () => {
    await openURL({ URL: 'www.chatwoot.com' });

    expect(openBrowserAsync).toHaveBeenCalledWith('https://www.chatwoot.com');
  });

  it.each([
    ['chatwoot.local:3000/path', 'https://chatwoot.local:3000/path'],
    ['www.chatwoot.com:8443', 'https://www.chatwoot.com:8443'],
    ['localhost:3000', 'https://localhost:3000'],
    ['192.168.1.5:3000/inbox?tab=1', 'https://192.168.1.5:3000/inbox?tab=1'],
  ])('treats %s as a host and port, not a scheme', async (target, expected) => {
    await openURL({ URL: target });

    expect(openBrowserAsync).toHaveBeenCalledWith(expected);
  });

  it('keeps a scheme whose target is numeric', async () => {
    await openURL({ URL: 'tel:12345' });

    expect(openBrowserAsync).not.toHaveBeenCalled();
    expect(openSystemURL).toHaveBeenCalledWith('tel:12345');
  });

  it('hands a non-web scheme to the system handler', async () => {
    await openURL({ URL: 'mailto:hello@chatwoot.com' });

    expect(openBrowserAsync).not.toHaveBeenCalled();
    expect(openSystemURL).toHaveBeenCalledWith('mailto:hello@chatwoot.com');
  });

  it('falls back to the system handler when the in-app browser fails', async () => {
    openBrowserAsync.mockRejectedValue(new Error('no activity found'));

    await openURL({ URL: 'https://chatwoot.com' });

    expect(openSystemURL).toHaveBeenCalledWith('https://chatwoot.com');
    expect(showToast).not.toHaveBeenCalled();
  });

  it('toasts when nothing can open the target', async () => {
    openBrowserAsync.mockRejectedValue(new Error('no activity found'));
    openSystemURL.mockRejectedValue(new Error('no activity found'));

    await openURL({ URL: 'https://chatwoot.com' });

    expect(showToast).toHaveBeenCalled();
  });

  it.each([
    'mention://user/14',
    'mention://user/5/Josephine',
    'mention://user/20/Ziva%20Immigration%20Support',
  ])('ignores the mention link %s', async target => {
    await openURL({ URL: target });

    expect(openBrowserAsync).not.toHaveBeenCalled();
    expect(openSystemURL).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('keeps the host of a protocol-relative target', async () => {
    await openURL({ URL: '//drive.google.com/file/d/1xvY/view?usp=drivesdk' });

    expect(openBrowserAsync).toHaveBeenCalledWith(
      'https://drive.google.com/file/d/1xvY/view?usp=drivesdk',
    );
  });

  it('ignores an empty target', async () => {
    await openURL({ URL: '   ' });

    expect(openBrowserAsync).not.toHaveBeenCalled();
    expect(openSystemURL).not.toHaveBeenCalled();
  });
});
