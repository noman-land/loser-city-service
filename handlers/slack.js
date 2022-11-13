const ALLOWED_SUBTYPES = ['file_share'];

import { SUFFIX } from '../constants';
import { sendSms } from '../api/twilioApi';
// import { getPublicUrl, slackFetch } from '../api/slackApi';

export const handleSlack = async (req) => {
  const {
    event: {
      // files: [{ permalink_public }] = [{}],
      message = {},
      previous_message = {},
      subtype,
      text,
      thread_ts,
    },
  } = await req.json();

  // const [, , fileId] = permalink_public.split('-');

  const phoneNumber = await LOSERS.get(thread_ts);

  if (
    (!subtype || ALLOWED_SUBTYPES.includes(subtype)) &&
    thread_ts &&
    phoneNumber
  ) {
    return sendSms({
      body: text,
      // mediaUrl: permalink_public,
      to: phoneNumber,
    });
  }

  const isBotMessage =
    previous_message.subtype === 'bot_message' &&
    previous_message.username.endsWith(SUFFIX);

  const isThreadDeleted =
    subtype === 'message_changed' &&
    message.subtype === 'tombstone' &&
    previous_message.thread_ts;

  const isNonThreadDeleted =
    subtype === 'message_deleted' && !previous_message.thread_ts;

  // Parent thread being deleted
  if (isBotMessage && (isThreadDeleted || isNonThreadDeleted)) {
    const phoneNumber = await LOSERS.get(previous_message.ts);

    await Promise.all([
      LOSERS.delete(phoneNumber),
      LOSERS.delete(previous_message.ts),
    ]);

    return new Response({ status: 200 });
  }

  return new Response({ status: 204 });
};

export const handleSlackChallenge = async (req) => {
  const { challenge } = await req.json();
  return new Response(challenge);
};
