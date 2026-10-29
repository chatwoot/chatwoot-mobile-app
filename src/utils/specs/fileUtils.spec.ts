import { getDisplayFileName } from '../fileUtils';

describe('getDisplayFileName', () => {
  it.each([
    ['%D0%A1%D1%87%D1%91%D1%82%208_57_26.xls', 'Счёт 8_57_26.xls'],
    ['%E6%96%87%E4%BB%B6.pdf', '文件.pdf'],
    ['report%20%231%20%26%2050%25.pdf', 'report #1 & 50%.pdf'],
    ['report+2026.pdf', 'report+2026.pdf'],
    ['report.pdf', 'report.pdf'],
    ['Счёт.xls', 'Счёт.xls'],
    ['%2520.txt', '%20.txt'],
    ['', ''],
  ])('decodes %s once to %s', (encoded, expected) => {
    expect(getDisplayFileName(encoded)).toBe(expected);
  });

  it.each(['report%name.pdf', 'report%2.pdf', '%D0%A1%D1.xls'])(
    'keeps the original name when escapes are malformed: %s',
    fileName => {
      expect(getDisplayFileName(fileName)).toBe(fileName);
    },
  );

  it.each([
    ['%D8%B4%09%D8%B4.pdf', 'ش   ش.pdf'],
    ['ش\tش.pdf', 'ش   ش.pdf'],
    ['ش%\tش.pdf', 'ش%  ش.pdf'],
  ])('expands tabs even when decoding fails: %s', (fileName, expected) => {
    expect(getDisplayFileName(fileName)).toBe(expected);
  });
});
