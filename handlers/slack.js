import { openModal, postSlackMessage } from '../api/slackApi';
import { sendSms } from '../api/twilioApi';
import { SUFFIX } from '../constants';
import {
  makeBlockModalPayload,
  makeRenameModalPayload,
} from '../utils/slackUtils';
import {
  deleteThread,
  getLoser,
  saveThread,
  setBlocked,
  setName,
} from '../utils/sqlUtils';

const ALLOWED_SUBTYPES = ['file_share'];

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
  const { phoneNumber } = await getLoser(thread_ts, env);
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
    const { phoneNumber } = await getLoser(previous_message.ts, env);

    if (phoneNumber) {
      await deleteThread(phoneNumber, env);
      return new Response(null, { status: 200 });
    }
  }

  return new Response(null, { status: 204 });
};

const getMessageParams = ({ body, threadTs }) =>
  threadTs
    ? {
        threadTs,
        text: `*Submitted through modal:* ${body}`,
      }
    : {
        text: `*Outgoing:* ${body}`,
      };

const handleSlackDropdownAction = async (
  { actions, message, trigger_id },
  env
) => {
  const { thread_ts } = message;
  const {
    selected_option: { value },
  } = actions[0];

  const { name, phoneNumber } = await getLoser(thread_ts, env);

  let modal;

  if (value === 'rename') {
    modal = makeRenameModalPayload({ name, phoneNumber });
  }

  if (value === 'block') {
    modal = makeBlockModalPayload({ name, phoneNumber });
  }

  await openModal({ modal, trigger_id }, env);

  return new Response(null, { status: 200 });
};

const handleSlackModalSubmission = async (payload, env) => {
  const { callback_id, state } = payload.view;

  if (callback_id === 'send-message-modal') {
    const {
      message: {
        messageAction: { value: body },
      },
      phoneNumber: {
        phoneNumberAction: { value: phoneNumber },
      },
    } = state.values;

    await sendSms(
      {
        body,
        to: phoneNumber,
      },
      env
    );

    const { name, threadTs } = await getLoser(phoneNumber, env);

    const response = await postSlackMessage(
      {
        name: name || phoneNumber,
        ...getMessageParams({ body, threadTs }),
      },
      env
    );

    if (!threadTs) {
      const {
        message: { ts },
      } = await response.json();

      await saveThread({ phoneNumber, threadTs: ts }, env);
    }

    return new Response(null, { status: 200 });
  }

  if (callback_id === 'rename-modal') {
    const { private_metadata: phoneNumber } = payload.view;
    const {
      name: {
        nameAction: { value: name },
      },
    } = state.values;

    await setName({ name, phoneNumber }, env);
    return new Response(null, { status: 200 });
  }

  if (callback_id === 'block-modal') {
    const { private_metadata: phoneNumber } = payload.view;
    await setBlocked(phoneNumber, env);
    return new Response(null, { status: 200 });
  }
};

export const handleSlack = async (req, env) => {
  const contentType = req.headers.get('Content-type');

  if (contentType === 'application/x-www-form-urlencoded') {
    const formData = await req.formData();
    const payload = JSON.parse(Object.fromEntries(formData.entries()).payload);

    if (payload.type === 'view_submission') {
      return handleSlackModalSubmission(payload, env);
    }

    if (payload.type === 'block_actions') {
      return handleSlackDropdownAction(payload, env);
    }

    return new Response(null, { status: 204 });
  }

  if (contentType === 'application/json') {
    const { event } = await req.json();
    return handleSlackMessage(event, env);
  }

  return new Response(null, { status: 204 });
};

export const handleSlackChallenge = async (req) => {
  const { challenge } = await req.json();
  return new Response(challenge);
};
