const NUTRIPLUS_DASHBOARD_URL =
  'https://nutriplus-precios.ever1822.chatgpt.site/operations/crm-panel/embed';

export function isNutriplusDashboardUrl(url: string) {
  try {
    return new URL(url).href === NUTRIPLUS_DASHBOARD_URL;
  } catch {
    return false;
  }
}

export function isNutriplusDashboardReadyMessage(url: string, data: string) {
  if (data !== 'nutriplus-dashboard-app:ready') return false;

  try {
    const source = new URL(url);
    const dashboard = new URL(NUTRIPLUS_DASHBOARD_URL);
    return source.href === dashboard.href || source.origin === dashboard.origin;
  } catch {
    return false;
  }
}

export function buildNutriplusBootstrapScript(token: string, installationUrl: string) {
  const chatwootOrigin = new URL(installationUrl).origin;
  const data = JSON.stringify({
    event: 'nutriplus-dashboard-bootstrap',
    data: { token },
  });

  return `(function () {
    const event = new MessageEvent("message", {
      data: ${JSON.stringify(data)},
      origin: ${JSON.stringify(chatwootOrigin)},
      source: window,
    });
    window.dispatchEvent(event);
    true;
  })();`;
}
