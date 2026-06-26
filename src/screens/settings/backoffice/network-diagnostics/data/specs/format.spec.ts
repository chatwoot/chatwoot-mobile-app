// data/specs/format.spec.ts
import {
  caseStatus,
  outcomeLabelKey,
  outcomeTone,
  caseDate,
  formatDateTime,
  parseEditHistory,
  isoDate,
  zeroFillByDay,
} from '../format';

describe('caseStatus', () => {
  it('returns resolvido only when explicitly set', () => {
    expect(caseStatus({ status: 'resolvido' } as never)).toBe('resolvido');
    expect(caseStatus({ status: 'pendente' } as never)).toBe('pendente');
    expect(caseStatus({} as never)).toBe('pendente'); // legacy -> pendente
  });
});

describe('outcomeLabelKey / outcomeTone', () => {
  it('maps known outcomes', () => {
    expect(outcomeLabelKey('instavel_transferido_suporte')).toBe(
      'NETWORK_DIAGNOSTICS.OUTCOME_INSTAVEL',
    );
    expect(outcomeTone('instavel_transferido_suporte')).toBe('warning');
    expect(outcomeTone('offline_transferido_suporte')).toBe('danger');
    expect(outcomeTone('problema_conexao_observado')).toBe('info');
  });
  it('falls back for unknown outcomes', () => {
    expect(outcomeLabelKey('weird')).toBe('weird');
    expect(outcomeTone('weird')).toBe('neutral');
    expect(outcomeLabelKey(undefined)).toBe('—');
  });
});

describe('caseDate', () => {
  it('uses created_at then sk prefix, else dash', () => {
    expect(caseDate({ created_at: '2026-06-25T09:26:00.000Z' } as never)).not.toBe('—');
    expect(caseDate({ sk: '2026-06-25T09:26:00.000Z#abc' } as never)).not.toBe('—');
    expect(caseDate({} as never)).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats valid ISO and dashes empty/invalid', () => {
    expect(formatDateTime('2026-06-25T09:26:00.000Z')).not.toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDateTime('nope')).toBe('—');
  });
});

describe('parseEditHistory', () => {
  it('parses arrays and tolerates junk', () => {
    expect(parseEditHistory('[{"at":"x","action":"status","to":"resolvido"}]')).toHaveLength(1);
    expect(parseEditHistory(undefined)).toEqual([]);
    expect(parseEditHistory('not json')).toEqual([]);
    expect(parseEditHistory('{"a":1}')).toEqual([]);
  });
});

describe('isoDate', () => {
  it('returns YYYY-MM-DD and respects daysAgo ordering', () => {
    expect(isoDate(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(isoDate(6) < isoDate(0)).toBe(true);
  });
});

describe('zeroFillByDay', () => {
  it('produces one ascending bucket per day, filling gaps with zeros', () => {
    const out = zeroFillByDay('2026-06-01', '2026-06-03', [
      {
        date: '2026-06-02',
        total: 5,
        instaveis: 2,
        offline: 1,
        conexao_observada: 2,
        transferido: 1,
      },
    ]);
    expect(out.map(b => b.date)).toEqual(['2026-06-01', '2026-06-02', '2026-06-03']);
    expect(out[0].total).toBe(0);
    expect(out[1].total).toBe(5);
  });
});
