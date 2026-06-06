import { generateValueFromPartsAndChangedText, parseValue } from '../utils';

describe('mentions input utils', () => {
  it('preserves emoji when text is typed after it', () => {
    const emoji = '\u{1F60A}';
    const { plainText, parts } = parseValue(emoji, []);

    expect(generateValueFromPartsAndChangedText(parts, plainText, `${emoji}Hello`)).toBe(
      `${emoji}Hello`,
    );
  });
});
