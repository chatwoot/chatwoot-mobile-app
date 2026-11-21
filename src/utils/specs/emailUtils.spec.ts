import { splitQuotedText } from '@/utils/emailUtils';

describe('#splitQuotedText', () => {
  it('returns text without quotes as the reply', () => {
    expect(splitQuotedText('Hi Michela,\n\nThanks for the update.')).toEqual({
      reply: 'Hi Michela,\n\nThanks for the update.',
      quoted: '',
    });
  });

  it('splits at a quoted attribution line', () => {
    const text =
      'Hi Michela,\n\nBest,\nAakash\n\n> On Fri, Nov 20, 2026 Björn wrote:\n>\n> Hi Aakash,';

    expect(splitQuotedText(text)).toEqual({
      reply: 'Hi Michela,\n\nBest,\nAakash',
      quoted: '> On Fri, Nov 20, 2026 Björn wrote:\n>\n> Hi Aakash,',
    });
  });

  it('splits at an unquoted attribution line', () => {
    const text =
      'Sounds good.\n\nOn Mon, 1 Dec 2026, Sam <sam@example.test> wrote:\nShould we proceed?';

    expect(splitQuotedText(text)).toEqual({
      reply: 'Sounds good.',
      quoted: 'On Mon, 1 Dec 2026, Sam <sam@example.test> wrote:\nShould we proceed?',
    });
  });

  it('splits at an original message header', () => {
    expect(splitQuotedText('Done.\n-----Original Message-----\nFrom: Sam')).toEqual({
      reply: 'Done.',
      quoted: '-----Original Message-----\nFrom: Sam',
    });
  });

  it('keeps text that is only a quote whole', () => {
    const text = '\n> On Mon, Sam wrote:\n> Only quoted content';

    expect(splitQuotedText(text)).toEqual({ reply: text, quoted: '' });
  });

  it('keeps inline quotes that are answered below them', () => {
    const text =
      'Hi Björn,\n\n> Is there any update on CW-8220?\n\nNot yet.\n\n> Which agent does Copilot use?\n\nThe first one.';

    expect(splitQuotedText(text)).toEqual({ reply: text, quoted: '' });
  });

  it('splits at the thread after inline answers', () => {
    const text = 'Hi Björn,\n\n> Any update?\n\nNot yet.\n\n> On Mon, Björn wrote:\n> Any update?';

    expect(splitQuotedText(text)).toEqual({
      reply: 'Hi Björn,\n\n> Any update?\n\nNot yet.',
      quoted: '> On Mon, Björn wrote:\n> Any update?',
    });
  });

  it('splits at a trailing run of quoted lines without an attribution', () => {
    expect(splitQuotedText('Sounds good.\n\n> earlier line one\n>\n> earlier line two')).toEqual({
      reply: 'Sounds good.',
      quoted: '> earlier line one\n>\n> earlier line two',
    });
  });

  it('splits at an attribution wrapped across two lines', () => {
    const text =
      'Thanks!\n\nOn Wed, Nov 18, 2026 at 3:49 PM Björn Viergutz <bjoern@example.test>\nwrote:\n> Hello';

    expect(splitQuotedText(text)).toEqual({
      reply: 'Thanks!',
      quoted:
        'On Wed, Nov 18, 2026 at 3:49 PM Björn Viergutz <bjoern@example.test>\nwrote:\n> Hello',
    });
  });

  it('keeps a line that mentions writing without being an attribution', () => {
    const text = 'On Monday I wrote the summary for you.';

    expect(splitQuotedText(text)).toEqual({ reply: text, quoted: '' });
  });
});
