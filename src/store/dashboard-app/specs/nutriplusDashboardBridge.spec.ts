import {
  buildNutriplusBootstrapScript,
  isNutriplusDashboardReadyMessage,
  isNutriplusDashboardUrl,
} from '../nutriplusDashboardBridge';

describe('NutriPlus dashboard mobile bridge', () => {
  const dashboardUrl = 'https://nutriplus-precios.ever1822.chatgpt.site/operations/crm-panel/embed';

  it('accepts only the exact NutriPlus dashboard URL', () => {
    expect(isNutriplusDashboardUrl(dashboardUrl)).toBe(true);
    expect(isNutriplusDashboardUrl(`${dashboardUrl}?other=1`)).toBe(false);
    expect(isNutriplusDashboardUrl('https://example.com/operations/crm-panel/embed')).toBe(false);
  });

  it('accepts ready from the exact NutriPlus URL or Android source origin', () => {
    expect(isNutriplusDashboardReadyMessage(dashboardUrl, 'nutriplus-dashboard-app:ready')).toBe(
      true,
    );

    expect(
      isNutriplusDashboardReadyMessage(
        'https://nutriplus-precios.ever1822.chatgpt.site',
        'nutriplus-dashboard-app:ready',
      ),
    ).toBe(true);

    expect(
      isNutriplusDashboardReadyMessage(dashboardUrl, 'chatwoot-dashboard-app:fetch-info'),
    ).toBe(false);

    expect(
      isNutriplusDashboardReadyMessage(
        'https://example.com/operations/crm-panel/embed',
        'nutriplus-dashboard-app:ready',
      ),
    ).toBe(false);
  });

  it('builds a bootstrap MessageEvent with the trusted Chatwoot origin', () => {
    const script = buildNutriplusBootstrapScript('signed-token', 'https://crm.crnutriplus.com/');

    expect(script).toContain('nutriplus-dashboard-bootstrap');
    expect(script).toContain('signed-token');
    expect(script).toContain('https://crm.crnutriplus.com');
    expect(script).toContain('source: window');
    expect(script).toContain('window.dispatchEvent');
  });
});
