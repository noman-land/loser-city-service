const ALLOWED_SUBTYPES = ['file_share'];

import { SUFFIX } from '../constants';
import { sendSms } from '../api/twilioApi';
import { postSlackMessage } from '../api/slackApi';
import { createThread, deleteThread, getPhoneNumber } from '../utils/sqlUtils';

const handleSlackMessage = async (
  {
    // files: [{ permalink_public }] = [{}],
    message = {},
    previous_message = {},
    subtype,
    text,
    thread_ts,
  },
  env
) => {
  const phoneNumber = await getPhoneNumber(thread_ts, env);

  // const [, , fileId] = permalink_public.split('-');

  // If it's a Slack thread reply
  if (
    (!subtype || ALLOWED_SUBTYPES.includes(subtype)) &&
    thread_ts &&
    phoneNumber
  ) {
    return sendSms(
      {
        body: text,
        // mediaUrl: permalink_public,
        to: phoneNumber,
      },
      env
    );
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

  // If parent thread is being deleted
  if (isBotMessage && (isThreadDeleted || isNonThreadDeleted)) {
    const phoneNumber = await getPhoneNumber(previous_message.ts, env);

    await deleteThread(phoneNumber, env);

    return new Response({ status: 200 });
  }

  return new Response({ status: 204 });
};

const handleSlackModalSubmission = async ({ type, view }, env) => {
  if (type === 'view_submission') {
    const {
      message: {
        messageAction: { value: body },
      },
      phoneNumber: {
        phoneNumberAction: { value: phoneNumber },
      },
    } = view.state.values;

    await sendSms(
      {
        body,
        to: phoneNumber,
      },
      env
    );

    const response = await postSlackMessage(
      {
        body,
        from: phoneNumber,
      },
      env
    );
    const {
      message: { ts },
    } = await response.json();

    await createThread({ phoneNumber, threadTs: ts }, env);

    return new Response({ status: 200 });
  }

  return new Response({ status: 204 });
};

export const handleSlack = async (req, env) => {
  const contentType = req.headers.get('Content-type');

  if (contentType === 'application/x-www-form-urlencoded') {
    const formData = await req.formData();
    const payload = JSON.parse(Object.fromEntries(formData.entries()).payload);
    return handleSlackModalSubmission(payload, env);
  }

  if (contentType === 'application/json') {
    const { event } = await req.json();
    return handleSlackMessage(event, env);
  }

  return new Response({ status: 204 });
};

export const handleSlackChallenge = async (req) => {
  const { challenge } = await req.json();
  return new Response(challenge);
};
