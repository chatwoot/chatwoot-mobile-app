import { getPlainText } from '@/utils/messageFormatterUtils';

describe('#getPlainText', () => {
  it('returns correct value for markdown with mention', () => {
    expect(getPlainText('Hello [@Muhsin](mention://user/1/Muhsin)')).toBe('Hello @Muhsin');
  });

  it('returns correct value for markdown with bold', () => {
    expect(getPlainText('Hello **Bold**')).toBe('Hello Bold');
  });

  it('returns correct value for markdown with link', () => {
    expect(getPlainText('Hello [Github.com](https://github.com)')).toBe('Hello Github.com');
  });

  it('returns correct value for markdown with bold and link', () => {
    expect(getPlainText('Hello [**Bold**](https://github.com)')).toBe('Hello Bold');
  });

  it('returns correct value for markdown with bold, link and mention', () => {
    expect(
      getPlainText('Hello [**Bold**](https://github.com) [@John](mention://user/1/John)'),
    ).toBe('Hello Bold @John');
  });

  it('returns correct value for markdown new line', () => {
    expect(getPlainText('Hello\nWorld')).toBe('Hello\nWorld');
  });
});
