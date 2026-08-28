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

  it('ignores an empty target', async () => {
    await openURL({ URL: '   ' });

    expect(openBrowserAsync).not.toHaveBeenCalled();
    expect(openSystemURL).not.toHaveBeenCalled();
  });
});
