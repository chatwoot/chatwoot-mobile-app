/**
 * @jest-environment jsdom
 */
import { Message } from '@/types';
import { buildEmailPreviewScript, getEmailHtml, splitQuotedText } from '@/utils/emailUtils';

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

  it('keeps an unquoted attribution line the agent wrote', () => {
    const text =
      'Sounds good.\n\nOn Monday Sam wrote:\n> We can ship on the 30th\n\nThat date holds.';

    expect(splitQuotedText(text)).toEqual({ reply: text, quoted: '' });
  });

  it('keeps the reply whole when the reply box appended no thread', () => {
    const text = 'Hi Pat,\n\n> On Mon, Sam wrote:\n> We can ship on the 30th';

    expect(splitQuotedText(text, false)).toEqual({ reply: text, quoted: '' });
  });

  it('splits only the trailing thread after an earlier attribution', () => {
    const text =
      'Hi Pat,\n\nOn Monday Sam wrote:\nwe can ship on the 30th.\n\n> On Mon, Pat wrote:\n> When do you ship?';

    expect(splitQuotedText(text, true)).toEqual({
      reply: 'Hi Pat,\n\nOn Monday Sam wrote:\nwe can ship on the 30th.',
      quoted: '> On Mon, Pat wrote:\n> When do you ship?',
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

  it('keeps a trailing quote without an attribution', () => {
    const text = 'Sounds good.\n\n> earlier line one\n>\n> earlier line two';

    expect(splitQuotedText(text)).toEqual({ reply: text, quoted: '' });
  });
});

const runPreviewScript = (html: string) => {
  document.body.innerHTML = html;
  new Function(buildEmailPreviewScript('View full email'))();
  return {
    hiddenText: Array.from(document.querySelectorAll('.cw-quote'))
      .map(node => node.textContent)
      .join(' '),
    hasLink: !!document.querySelector('.cw-full-email-link'),
  };
};

const gmailForward = (forwardedBody: string) => `
  <div dir="ltr">Please see the thread below.</div>
  <br>
  <div class="gmail_quote gmail_quote_container">
    <div dir="ltr" class="gmail_attr">---------- Forwarded message ---------<br>
      From: Sam Patel &lt;sam@acme.test&gt;<br>Date: Mon, 2 Mar 2026<br>Subject: Delivery</div>
    <br><br>
    ${forwardedBody}
  </div>`;

describe('#buildEmailPreviewScript', () => {
  it('hides the quoted thread of a reply', () => {
    const { hiddenText, hasLink } = runPreviewScript(`
      <div dir="ltr">Thanks, that works.</div>
      <div class="gmail_quote gmail_quote_container">
        <div class="gmail_attr">On Mon, 2 Mar 2026 Sam Patel wrote:</div>
        <blockquote class="gmail_quote">We can deliver on 10 March.</blockquote>
      </div>`);

    expect(hasLink).toBe(true);
    expect(hiddenText).toContain('We can deliver on 10 March.');
  });

  it('keeps a forwarded email with a nested reply thread visible', () => {
    const { hiddenText, hasLink } = runPreviewScript(
      gmailForward(`
        <div dir="ltr">Could you confirm the date?</div>
        <div class="gmail_quote gmail_quote_container">
          <div class="gmail_attr">On Sun, 1 Mar 2026 Lena Fischer wrote:</div>
          <blockquote class="gmail_quote">Please share the schedule.</blockquote>
        </div>`),
    );

    expect(hasLink).toBe(false);
    expect(hiddenText).toBe('');
  });

  it('keeps a forwarded email with an Outlook header block visible', () => {
    const { hiddenText, hasLink } = runPreviewScript(
      gmailForward(`
        <div dir="ltr">Could you confirm the date?</div>
        <div>From: Lena Fischer<br>Sent: Sunday, 1 March 2026<br>Subject: Schedule</div>
        <div>Please share the schedule.</div>`),
    );

    expect(hasLink).toBe(false);
    expect(hiddenText).toBe('');
  });

  it('keeps a plain-text reply written below the quote', () => {
    const { hasLink } = runPreviewScript(
      'Hi Sam,<br><br>On Mon, 2 Mar 2026 Sam Patel wrote:<br>&gt; Can we ship Monday?<br><br>Please wait until Friday',
    );

    expect(hasLink).toBe(false);
  });

  it('keeps a reply below the quote in a plain-text email with addresses', () => {
    const message = {
      contentAttributes: {
        email: {
          textContent: {
            full: 'Hi Sam,\n\nOn Mon, 2 Mar 2026, Sam <sam@acme.test> wrote:\n> Can we ship Monday?\n\nPlease wait until Friday',
          },
        },
      },
    } as Message;
    const { hasLink } = runPreviewScript(getEmailHtml(message));

    expect(hasLink).toBe(false);
    expect(document.body.textContent).toContain('Sam <sam@acme.test> wrote:');
  });

  it('keeps a reply written below an attributed quote', () => {
    const { hasLink } = runPreviewScript(`
      <div>Hi Sam,</div>
      <div>On Mon, 2 Mar 2026 Sam Patel wrote:</div>
      <blockquote>Can we ship Monday?</blockquote>
      <div>Please wait until Friday</div>`);

    expect(hasLink).toBe(false);
  });

  it('keeps a reply written below a Gmail quote', () => {
    const { hasLink } = runPreviewScript(`
      <div dir="ltr">Hi Sam,</div>
      <div class="gmail_quote gmail_quote_container">
        <div class="gmail_attr">On Mon, 2 Mar 2026 Sam Patel wrote:</div>
        <blockquote class="gmail_quote">Can we ship Monday?</blockquote>
      </div>
      <div>Please wait until Friday</div>`);

    expect(hasLink).toBe(false);
  });

  it('hides a plain-text thread that ends the email', () => {
    const { hiddenText, hasLink } = runPreviewScript(
      'Please wait until Friday<br><br>On Mon, 2 Mar 2026 Sam Patel wrote:<br>&gt; Can we ship Monday?',
    );

    expect(hasLink).toBe(true);
    expect(hiddenText).toContain('Can we ship Monday?');
  });

  it('hides an Outlook thread below its header', () => {
    const { hiddenText, hasLink } = runPreviewScript(`
      <div>Thanks, that works.</div>
      <div id="appendonsend"></div>
      <hr>
      <div id="divRplyFwdMsg">From: Sam Patel<br>Sent: Monday, 2 March 2026</div>
      <div>We can deliver on 10 March.</div>`);

    expect(hasLink).toBe(true);
    expect(hiddenText).toContain('We can deliver on 10 March.');
  });

  it('keeps an Apple Mail forward visible', () => {
    const { hiddenText, hasLink } = runPreviewScript(`
      <div>FYI, see below.</div>
      <div><br><blockquote type="cite">
        <div>Begin forwarded message:</div><br>
        <div><b>From: </b>Pat &lt;pat@acme.test&gt;</div>
        <div><b>Subject: </b>Invoice</div>
        <div><b>Date: </b>2 March 2026</div>
        <br><div>The invoice total is 450 USD.</div>
      </blockquote></div>`);

    expect(hasLink).toBe(false);
    expect(hiddenText).toBe('');
  });
});
