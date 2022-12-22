import { openModal } from '../api/slackApi';
import { makeSendMessageModalPayload } from '../utils/slackUtils';

export const handleSlashCommand = async (req, env) => {
  const formData = await req.formData();
  const { text, trigger_id } = Object.fromEntries(formData.entries());
  const words = text.split(' ');
  const phoneNumber = words.shift();
  const message = words.join(' ');

  if (phoneNumber && message) {
    return new Response(null, { status: 200 });
  }

  await openModal(
    {
      trigger_id,
      modal: makeSendMessageModalPayload(phoneNumber, message),
    },
    env
  );

  return new Response(null, { status: 200 });
};
