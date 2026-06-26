// data/specs/client.spec.ts
import {
  fetchNetworkCases, fetchNetworkStats,
  updateNetworkCaseStatus, updateNetworkCaseComment,
} from '../client';

const okJson = (body: unknown) =>
  Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response);

describe('network diagnostics client', () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { jest.restoreAllMocks(); });

  it('posts a list body with bearer auth and omits undefined filters', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ success: true, items: [], page: 1, page_size: 25, total: 0, total_pages: 0, has_more: false }));
    await fetchNetworkCases('tok', 4, { from: '2026-06-01', to: '2026-06-07', page: 2, page_size: 25, churn_risk: undefined, status: 'pendente' });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ action: 'list', account_id: 4, page: 2, status: 'pendente' });
    expect('churn_risk' in body).toBe(false);
  });

  it('sends the stats action', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ success: true, stats: { total: 0, by_outcome: {}, transferidos: 0, conexao_observada: 0, instaveis: 0, offline: 0 } }));
    await fetchNetworkStats('tok', 4, '2026-06-01', '2026-06-07');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toEqual({ action: 'stats', account_id: 4, from: '2026-06-01', to: '2026-06-07' });
  });

  it('sends update_status and update_comment actions', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ success: true, item: { account_id: 4, sk: 's' } }));
    await updateNetworkCaseStatus('tok', 4, 's', 'resolvido');
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toEqual({ action: 'update_status', account_id: 4, sk: 's', status: 'resolvido' });
    await updateNetworkCaseComment('tok', 4, 's', 'nota');
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body)).toEqual({ action: 'update_comment', account_id: 4, sk: 's', comentario: 'nota' });
  });

  it('throws the server error on success:false', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ success: false, error: 'forbidden_account' }));
    await expect(fetchNetworkCases('tok', 9, {})).rejects.toThrow('forbidden_account');
  });

  it('throws on a non-ok HTTP response', async () => {
    (global.fetch as jest.Mock).mockReturnValue(Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'invalid_token' }) } as Response));
    await expect(fetchNetworkStats('tok', 4)).rejects.toThrow('invalid_token');
  });
});
