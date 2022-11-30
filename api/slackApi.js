import { SUFFIX } from '../constants';
import { toBlocks } from '../utils/slackUtils';

export const slackFetch = async (
  {
    body,
    contentType = 'application/json; charset=utf-8',
    method = 'GET',
    url,
  },
  env
) =>
  fetch(url, {
    body,
    headers: {
      authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
      'content-type': contentType,
    },
    method,
  });

export const slackPost = async (url, body = {}, env) =>
  slackFetch(
    {
      body: JSON.stringify(body),
      method: 'POST',
      url,
    },
    env
  );

export const openModal = async ({ modal, trigger_id }, env) =>
  slackPost(
    'https://slack.com/api/views.open',
    { trigger_id, view: modal },
    env
  );

export const postSlackMessage = async (
  { body, from, media, threadTs },
  env
) => {
  const threadProps = {};

  if (threadTs) {
    threadProps.thread_ts = threadTs;
    threadProps.reply_broadcast = true;
  }

  return slackPost(
    'https://slack.com/api/chat.postMessage',
    {
      blocks: toBlocks({ text: body, media }),
      channel: env.SLACK_CHANNEL_ID,
      link_names: false,
      unfurl_links: false,
      username: `${from}${SUFFIX}`,
      ...threadProps,
    },
    env
  );
};
