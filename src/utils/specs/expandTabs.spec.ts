import { expandTabs } from '@/utils/expandTabs';

describe('#expandTabs', () => {
  it('returns text without tabs unchanged', () => {
    expect(expandTabs('Hello World')).toBe('Hello World');
  });

  it('returns a missing value unchanged', () => {
    expect(expandTabs(null as unknown as string)).toBeNull();
    expect(expandTabs(undefined as unknown as string)).toBeUndefined();
  });

  it('expands a tab to the next four-column stop', () => {
    expect(expandTabs('ab\tc')).toBe('ab  c');
    expect(expandTabs('abcd\tx')).toBe('abcd    x');
  });

  it('keeps indentation on the tab stop after leading spaces', () => {
    expect(expandTabs('  \tx')).toBe('    x');
  });

  it('restarts columns on each line', () => {
    expect(expandTabs('abc\n\ty')).toBe('abc\n    y');
  });

  it('restarts columns after carriage-return line endings', () => {
    expect(expandTabs('ab\r\tx')).toBe('ab\r    x');
    expect(expandTabs('ab\r\n\tx')).toBe('ab\r\n    x');
  });

  it('removes tabs from Arabic text', () => {
    expect(expandTabs('شكرا لك\tعلى تواصلك معنا')).not.toContain('\t');
  });
});
