import { buildDiagnosticsUrl, getNetworkDiagnosticsUrl } from '../config';

// `EXPO_PUBLIC_*` is inlined by babel-preset-expo at transform time, so it
// cannot be overridden at runtime in a test. The base→URL logic is therefore
// tested through the pure `buildDiagnosticsUrl`; `getNetworkDiagnosticsUrl`
// is only asserted to end in the route (its base depends on the build env).

describe('buildDiagnosticsUrl', () => {
  it('appends the webhook route to the base', () => {
    expect(buildDiagnosticsUrl('https://services.synapz.tech/webhook')).toBe(
      'https://services.synapz.tech/webhook/casos-diagnostico-rede',
    );
  });

  it('strips a trailing slash from the base', () => {
    expect(buildDiagnosticsUrl('https://n8n.example.com/webhook/')).toBe(
      'https://n8n.example.com/webhook/casos-diagnostico-rede',
    );
  });
});

describe('getNetworkDiagnosticsUrl', () => {
  it('builds a URL ending in the webhook route', () => {
    expect(getNetworkDiagnosticsUrl()).toMatch(/\/casos-diagnostico-rede$/);
  });
});
