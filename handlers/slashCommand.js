import { openModal } from '../api/slackApi';
import { makeSendMessageModalPayload } from '../utils/slackUtils';

export const handleSlashCommand = async (req, env) => {
  const formData = await req.formData();
  const { text, trigger_id } = Object.fromEntries(formData.entries());
  const words = text.split(' ');

  try {
    await openModal(
      {
        trigger_id,
        modal: makeSendMessageModalPayload(words.shift(), words.join(' ')),
      },
      env
    );

    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response(error.message || 'Unexpected error opening modal', {
      status: error.status || 500,
    });
  }
};
