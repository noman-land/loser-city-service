import { SUFFIX } from '../constants';
import { makeMessageSections } from '../utils/slackUtils';

export const slackApi = async (
  url,
  { body, contentType = 'application/json; charset=utf-8', method = 'GET' },
  env
) =>
  fetch(`https://slack.com/api/${url}`, {
    body,
    headers: {
      authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
      'content-type': contentType,
    },
    method,
  });

export const slackPost = async (url, body = {}, env) =>
  slackApi(
    url,
    {
      body: JSON.stringify(body),
      method: 'POST',
    },
    env
  );

export const openModal = async ({ modal, trigger_id }, env) =>
  slackPost('views.open', { trigger_id, view: modal }, env);

export const postSlackMessage = async (
  { media, name, text, threadTs },
  env
) => {
  const threadProps = {};

  if (threadTs) {
    threadProps.thread_ts = threadTs;
    threadProps.reply_broadcast = true;
  }

  return slackPost(
    'chat.postMessage',
    {
      blocks: makeMessageSections({ isThread: !!threadTs, media, text }),
      channel: env.SLACK_CHANNEL_ID,
      link_names: false,
      unfurl_links: false,
      username: `${name}${SUFFIX}`,
      ...threadProps,
    },
    env
  );
};

export const updateSlackMessage = async ({ name, threadTs }, env) =>
  slackPost(
    'chat.update',
    {
      as_user: true,
      // blocks: [
      //   { type: 'section', text: { type: 'plain_text', text: 'Hello world' } },
      // ],
      channel: env.SLACK_CHANNEL_ID,
      ts: threadTs,
    },
    env
  );
