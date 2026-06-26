import { getNetworkDiagnosticsUrl } from '../config';

describe('getNetworkDiagnosticsUrl', () => {
  const OLD = process.env.EXPO_PUBLIC_N8N_BASE_URL;
  afterEach(() => {
    process.env.EXPO_PUBLIC_N8N_BASE_URL = OLD;
  });

  it('defaults to the services.synapz.tech webhook host', () => {
    delete process.env.EXPO_PUBLIC_N8N_BASE_URL;
    expect(getNetworkDiagnosticsUrl()).toBe(
      'https://services.synapz.tech/webhook/casos-diagnostico-rede',
    );
  });

  it('uses the env base and strips a trailing slash', () => {
    process.env.EXPO_PUBLIC_N8N_BASE_URL = 'https://n8n.example.com/webhook/';
    expect(getNetworkDiagnosticsUrl()).toBe(
      'https://n8n.example.com/webhook/casos-diagnostico-rede',
    );
  });
});
