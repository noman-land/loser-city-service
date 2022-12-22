import {
  openModal,
  postSlackMessage,
  updateSlackMessage,
} from '../api/slackApi';
import { sendSms } from '../api/twilioApi';
import { SUFFIX } from '../constants';
import { makeModalPayload } from '../utils/slackUtils';
import {
  deleteThread,
  getLoser,
  insertThread,
  setBlocked,
  setName,
  setThreadTs,
} from '../utils/sqlUtils';

const ALLOWED_SUBTYPES = ['file_share'];

const handleSlackJson = async (req, env) => {
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

const handleSlackDropdownAction = async (
  { actions: [action], message, trigger_id },
  env
) => {
  const { ts: threadTs } = message;
  const {
    selected_option: { value: modalType },
  } = action;

  const modal = await makeModalPayload({ modalType, threadTs }, env);

  await openModal({ modal, trigger_id }, env);

  return new Response(null, { status: 200 });
};

const handleSendMessageModal = async ({ state }, env) => {
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

  const {
    name,
    phoneNumber: knownLoser,
    threadTs: existingThread,
  } = await getLoser(phoneNumber, env);

  const messageParams = existingThread
    ? {
        threadTs: existingThread,
        text: `*Submitted through modal:* ${body}`,
      }
    : {
        text: `*Outgoing:* ${body}`,
      };

  const response = await postSlackMessage(
    {
      name: name || phoneNumber,
      ...messageParams,
    },
    env
  );

  if (!existingThread) {
    const {
      message: { ts: newThreadTs },
    } = await response.json();

    const dbAction = knownLoser ? setThreadTs : insertThread;
    await dbAction({ phoneNumber, threadTs: newThreadTs }, env);
  }

  return new Response(null, { status: 200 });
};

const handleRenameModal = async (
  { private_metadata: phoneNumber, state },
  env
) => {
  const {
    name: {
      nameAction: { value: name },
    },
  } = state.values;

  const { threadTs } = await setName({ name, phoneNumber }, env);
  // await renameSlackThread({ name, threadTs }, env);
  return new Response(null, { status: 200 });
};

const handleBlockModal = async ({ private_metadata: phoneNumber }, env) => {
  await setBlocked(phoneNumber, env);
  // await updateSlackThreadToBlocked({ phoneNumber }, env);
  return new Response(null, { status: 200 });
};

const handleSlackModalSubmission = async ({ view }, env) => {
  const { callback_id } = view;

  if (callback_id === 'send-message-modal') {
    return handleSendMessageModal(view, env);
  }

  if (callback_id === 'rename-modal') {
    return handleRenameModal(view, env);
  }

  if (callback_id === 'block-modal') {
    return handleBlockModal(view, env);
  }

  return new Response(`Unknown modal callback_id "${callback_id}", ignoring.`, {
    status: 404,
  });
};

const handleSlackForm = async (req) => {
  const formData = await req.formData();
  const payload = JSON.parse(Object.fromEntries(formData.entries()).payload);

  if (payload.type === 'view_submission') {
    return handleSlackModalSubmission(payload, env);
  }

  if (payload.type === 'block_actions') {
    return handleSlackDropdownAction(payload, env);
  }

  return new Response(null, { status: 204 });
};

export const handleSlack = async (req, env) => {
  const contentType = req.headers.get('Content-type');

  if (contentType === 'application/x-www-form-urlencoded') {
    return handleSlackForm(req);
  }

  if (contentType === 'application/json') {
    return handleSlackJson(req, env);
  }

  return new Response(null, { status: 204 });
};

export const handleSlackChallenge = async (req) => {
  const { challenge } = await req.json();
  return new Response(challenge);
};
