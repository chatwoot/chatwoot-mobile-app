import React, { useEffect, useRef, useState } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import i18n from '@/i18n';

import { tailwind } from '@/theme';

const content = `Hi Team,\n\nI hope this email finds you well! I wanted to share some updates regarding our integration with Chatwoot and outline some key features we’ve explored.\n\n---------------------------------------------------------------\n\nKey Updates\n\n-\n\nIntegration Status:\nThe initial integration with Chatwoot has been successful. We've tested:\n\n- API connectivity\n- Multi-channel messaging\n- Real-time chat updates\n\n-\n\nUpcoming Tasks:\n\n- Streamlining notification workflows\n- Enhancing webhook reliability\n- Testing team collaboration features\n\n>\n---------------------------------------------------------------\n\nFeatures We Love\n\nHere’s what stood out so far:\n\n-  Unified Inbox: All customer conversations in one place.\n-  Customizable Workflows: Tailored to our team’s unique needs.\n-  Integrations: Works seamlessly with CRM and Slack.\n\n---------------------------------------------------------------\n\nAction Items\n\nFor Next Week:\n\n- Implement the webhook for ticket prioritization.\n- Test CSAT surveys post-chat sessions.\n- Review analytics dashboard insights.\n\n---------------------------------------------------------------\n\nData Snapshot\n\nHere’s a quick overview of our conversation stats this week:\n\nMetric\tValue\tChange (%)\nTotal Conversations\t350\t+25%\nAverage Response Time\t3 minutes\t-15%\nCSAT Score\t92%\t+10%\n---------------------------------------------------------------\n\nFeedback\n\nDo let me know if you have additional feedback or ideas to improve our workflows. Here’s an image of how our Chatwoot dashboard looks with recent changes:\n\n[Chatwoot Dashboard]\n\n---------------------------------------------------------------\n\nLooking forward to hearing your thoughts!\n\nBest regards,\n~ Shivam Mishra"`;

const contentAttributes = {
  email: {
    bcc: null,
    cc: null,
    content_type: 'multipart/alternative; boundary=0000000000009d889e0628477235',
    date: '2024-12-02T16:29:39+05:30',
    from: ['hey@shivam.dev'],
    html_content: {
      full: '<div dir="ltr"><h3><span style="font-size:small;font-weight:normal">Hi Team,</span></h3>\r\n<p>I hope this email finds you well! I wanted to share some updates regarding our integration with <strong>Chatwoot</strong> and outline some key features we’ve explored.</p>\r\n<hr>\r\n<h3>Key Updates</h3>\r\n<ol>\r\n<li>\r\n<p><strong>Integration Status</strong>:<br>\r\nThe initial integration with Chatwoot has been successful. We&#39;ve tested:</p>\r\n<ul>\r\n<li>API connectivity</li>\r\n<li>Multi-channel messaging</li>\r\n<li>Real-time chat updates</li>\r\n</ul>\r\n</li>\r\n<li>\r\n<p><strong>Upcoming Tasks</strong>:</p>\r\n<ul>\r\n<li>Streamlining notification workflows</li>\r\n<li>Enhancing webhook reliability</li>\r\n<li>Testing team collaboration features</li>\r\n</ul>\r\n</li>\r\n</ol>\r\n<blockquote>\r\n<p><strong>Note:</strong><br>\r\nDon’t forget to check out the automation capabilities in Chatwoot for handling repetitive queries. It can save a ton of time!</p>\r\n</blockquote>\r\n<hr>\r\n<h3>Features We Love</h3>\r\n<p>Here’s what stood out so far:</p>\r\n<ul>\r\n<li><strong>Unified Inbox</strong>: All customer conversations in one place.</li>\r\n<li><strong>Customizable Workflows</strong>: Tailored to our team’s unique needs.</li>\r\n<li><strong>Integrations</strong>: Works seamlessly with CRM and Slack.</li>\r\n</ul>\r\n<hr>\r\n<h3>Action Items</h3>\r\n<h4>For Next Week:</h4>\r\n<ol>\r\n<li>Implement the webhook for <strong>ticket prioritization</strong>.</li>\r\n<li>Test <strong>CSAT surveys</strong> post-chat sessions.</li>\r\n<li>Review <strong>analytics dashboard</strong> insights.</li>\r\n</ol>\r\n<hr>\r\n<h3>Data Snapshot</h3>\r\n<p>Here’s a quick overview of our conversation stats this week:</p>\r\n<table>\r\n<thead>\r\n<tr>\r\n<th>Metric</th>\r\n<th>Value</th>\r\n<th>Change (%)</th>\r\n</tr>\r\n</thead>\r\n<tbody>\r\n<tr>\r\n<td>Total Conversations</td>\r\n<td>350</td>\r\n<td>+25%</td>\r\n</tr>\r\n<tr>\r\n<td>Average Response Time</td>\r\n<td>3 minutes</td>\r\n<td>-15%</td>\r\n</tr>\r\n<tr>\r\n<td>CSAT Score</td>\r\n<td>92%</td>\r\n<td>+10%</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<hr>\r\n<h3>Feedback</h3>\r\n<p><i>Do let me know if you have additional feedback or ideas to improve our workflows. Here’s an image of how our Chatwoot dashboard looks with recent changes:</i></p>\r\n<p><img src="https://via.placeholder.com/600x300" alt="Chatwoot Dashboard Screenshot" title="Chatwoot Dashboard"></p>\r\n<hr>\r\n<p>Looking forward to hearing your thoughts!</p>\r\n<p>Best regards,<br>~ Shivam Mishra<br></p></div>\r\n',
      reply:
        "Hi Team,\n\nI hope this email finds you well! I wanted to share some updates regarding our integration with Chatwoot and outline some key features we’ve explored.\n\n---------------------------------------------------------------\n\nKey Updates\n\n-\n\nIntegration Status:\nThe initial integration with Chatwoot has been successful. We've tested:\n\n- API connectivity\n- Multi-channel messaging\n- Real-time chat updates\n\n-\n\nUpcoming Tasks:\n\n- Streamlining notification workflows\n- Enhancing webhook reliability\n- Testing team collaboration features\n\n>\n---------------------------------------------------------------\n\nFeatures We Love\n\nHere’s what stood out so far:\n\n-  Unified Inbox: All customer conversations in one place.\n-  Customizable Workflows: Tailored to our team’s unique needs.\n-  Integrations: Works seamlessly with CRM and Slack.\n\n---------------------------------------------------------------\n\nAction Items\n\nFor Next Week:\n\n- Implement the webhook for ticket prioritization.\n- Test CSAT surveys post-chat sessions.\n- Review analytics dashboard insights.\n\n---------------------------------------------------------------\n\nData Snapshot\n\nHere’s a quick overview of our conversation stats this week:\n\nMetric\tValue\tChange (%)\nTotal Conversations\t350\t+25%\nAverage Response Time\t3 minutes\t-15%\nCSAT Score\t92%\t+10%\n---------------------------------------------------------------\n\nFeedback\n\nDo let me know if you have additional feedback or ideas to improve our workflows. Here’s an image of how our Chatwoot dashboard looks with recent changes:\n\n[Chatwoot Dashboard]\n\n---------------------------------------------------------------\n\nLooking forward to hearing your thoughts!\n\nBest regards,\n~ Shivam Mishra",
      quoted:
        'Hi Team,\n\nI hope this email finds you well! I wanted to share some updates regarding our integration with Chatwoot and outline some key features we’ve explored.',
    },
    in_reply_to: null,
    message_id: 'CAM_Qp+8bpiT5xFL7HmVL4a9RD0TmdYw7Lu6ZV02yu=eyon41DA@mail.gmail.com',
    multipart: true,
    number_of_attachments: 0,
    subject: 'Update on Chatwoot Integration and Features',
    text_content: {
      full: "Hi Team,\r\n\r\nI hope this email finds you well! I wanted to share some updates regarding\r\nour integration with *Chatwoot* and outline some key features we’ve\r\nexplored.\r\n------------------------------\r\nKey Updates\r\n\r\n   1.\r\n\r\n   *Integration Status*:\r\n   The initial integration with Chatwoot has been successful. We've tested:\r\n   - API connectivity\r\n      - Multi-channel messaging\r\n      - Real-time chat updates\r\n   2.\r\n\r\n   *Upcoming Tasks*:\r\n   - Streamlining notification workflows\r\n      - Enhancing webhook reliability\r\n      - Testing team collaboration features\r\n\r\n*Note:*\r\nDon’t forget to check out the automation capabilities in Chatwoot for\r\nhandling repetitive queries. It can save a ton of time!\r\n\r\n------------------------------\r\nFeatures We Love\r\n\r\nHere’s what stood out so far:\r\n\r\n   - *Unified Inbox*: All customer conversations in one place.\r\n   - *Customizable Workflows*: Tailored to our team’s unique needs.\r\n   - *Integrations*: Works seamlessly with CRM and Slack.\r\n\r\n------------------------------\r\nAction Items For Next Week:\r\n\r\n   1. Implement the webhook for *ticket prioritization*.\r\n   2. Test *CSAT surveys* post-chat sessions.\r\n   3. Review *analytics dashboard* insights.\r\n\r\n------------------------------\r\nData Snapshot\r\n\r\nHere’s a quick overview of our conversation stats this week:\r\nMetric Value Change (%)\r\nTotal Conversations 350 +25%\r\nAverage Response Time 3 minutes -15%\r\nCSAT Score 92% +10%\r\n------------------------------\r\nFeedback\r\n\r\n*Do let me know if you have additional feedback or ideas to improve our\r\nworkflows. Here’s an image of how our Chatwoot dashboard looks with recent\r\nchanges:*\r\n\r\n[image: Chatwoot Dashboard Screenshot]\r\n------------------------------\r\n\r\nLooking forward to hearing your thoughts!\r\n\r\nBest regards,\r\n~ Shivam Mishra\r\n",
      reply:
        "Hi Team,\n\nI hope this email finds you well! I wanted to share some updates regarding\nour integration with *Chatwoot* and outline some key features we’ve\nexplored.\n------------------------------\nKey Updates\n\n   1.\n\n   *Integration Status*:\n   The initial integration with Chatwoot has been successful. We've tested:\n   - API connectivity\n      - Multi-channel messaging\n      - Real-time chat updates\n   2.\n\n   *Upcoming Tasks*:\n   - Streamlining notification workflows\n      - Enhancing webhook reliability\n      - Testing team collaboration features\n\n*Note:*\nDon’t forget to check out the automation capabilities in Chatwoot for\nhandling repetitive queries. It can save a ton of time!\n\n------------------------------\nFeatures We Love\n\nHere’s what stood out so far:\n\n   - *Unified Inbox*: All customer conversations in one place.\n   - *Customizable Workflows*: Tailored to our team’s unique needs.\n   - *Integrations*: Works seamlessly with CRM and Slack.\n\n------------------------------\nAction Items For Next Week:\n\n   1. Implement the webhook for *ticket prioritization*.\n   2. Test *CSAT surveys* post-chat sessions.\n   3. Review *analytics dashboard* insights.\n\n------------------------------\nData Snapshot\n\nHere’s a quick overview of our conversation stats this week:\nMetric Value Change (%)\nTotal Conversations 350 +25%\nAverage Response Time 3 minutes -15%\nCSAT Score 92% +10%\n------------------------------\nFeedback\n\n*Do let me know if you have additional feedback or ideas to improve our\nworkflows. Here’s an image of how our Chatwoot dashboard looks with recent\nchanges:*\n\n[image: Chatwoot Dashboard Screenshot]\n------------------------------\n\nLooking forward to hearing your thoughts!\n\nBest regards,\n~ Shivam Mishra",
      quoted:
        'Hi Team,\n\nI hope this email finds you well! I wanted to share some updates regarding\nour integration with *Chatwoot* and outline some key features we’ve\nexplored.',
    },
    to: ['shivam@chatwoot.com'],
  },
  ccEmail: null,
  bccEmail: null,
};

const sender = {
  name: 'Muhsin',
  email: 'muhsin@chatwoot.com',
};
const subject = 'Refund for order#817298723';

export const Email = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  const fromEmail = contentAttributes?.email?.from ?? [];

  const toEmail = contentAttributes?.email?.to ?? [];

  const ccEmail = contentAttributes?.ccEmail ?? contentAttributes?.email?.cc ?? [];

  const bccEmail = contentAttributes?.bccEmail ?? contentAttributes?.email?.bcc ?? [];

  const senderName = sender?.name ?? fromEmail[0];

  const showMeta = fromEmail[0] || toEmail.length || ccEmail.length || bccEmail.length || subject;

  useEffect(() => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      setIsOverflowing(scrollHeight > clientHeight);
    }
  }, [contentRef]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Animated.View style={[tailwind.style('flex')]}>
      {showMeta && (
        <Animated.View style={tailwind.style('flex flex-col gap-1')}>
          {fromEmail[0] && (
            <Animated.Text
              style={tailwind.style('text-gray-950 font-inter-normal-20 tracking-[0.16px]')}>
              {senderName} &lt;{fromEmail[0]}&gt;
            </Animated.Text>
          )}

          {toEmail.length > 0 && (
            <Animated.Text
              style={tailwind.style('text-gray-900 font-inter-normal-20 tracking-[0.32px]')}>
              {i18n.t('CONVERSATION.EMAIL_HEADER.TO')}: {toEmail.join(', ')}
            </Animated.Text>
          )}

          {ccEmail.length > 0 && (
            <Animated.Text
              style={tailwind.style('text-gray-900 font-inter-normal-20 tracking-[0.32px]')}>
              {i18n.t('CONVERSATION.EMAIL_HEADER.CC')}: {ccEmail.join(', ')}
            </Animated.Text>
          )}

          {bccEmail.length > 0 && (
            <Animated.Text
              style={tailwind.style('text-gray-900 font-inter-normal-20 tracking-[0.32px]')}>
              {i18n.t('CONVERSATION.EMAIL_HEADER.BCC')}: {bccEmail}
            </Animated.Text>
          )}

          {subject && (
            <Animated.Text
              style={tailwind.style('text-gray-900 font-inter-normal-20 tracking-[0.32px]')}>
              {i18n.t('CONVERSATION.EMAIL_HEADER.SUBJECT')}: {subject}
            </Animated.Text>
          )}
        </Animated.View>
      )}
      <Animated.View style={tailwind.style('h-[1px] my-2 bg-gray-300')} />
      <Animated.View
        ref={contentRef}
        style={[
          tailwind.style('flex bg-white rounded-2xl relative'),
          !isExpanded && { maxHeight: 400 },
        ]}>
        <Animated.View style={tailwind.style('px-4 py-2')}>
          <Animated.Text
            style={tailwind.style('text-gray-900 font-inter-normal-20 tracking-[0.32px]')}>
            {content}
          </Animated.Text>
        </Animated.View>

        {!isOverflowing && !isExpanded && (
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
            style={[
              tailwind.style('absolute left-0 right-0 bottom-0 h-40 items-center justify-end'),
            ]}>
            <TouchableOpacity
              onPress={toggleExpand}
              style={tailwind.style('flex-row items-center gap-2 px-8 py-2 mb-4  rounded-full')}>
              <Animated.Text style={tailwind.style('text-blue-800 font-inter-medium-24')}>
                Expand
              </Animated.Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </Animated.View>
    </Animated.View>
  );
};
