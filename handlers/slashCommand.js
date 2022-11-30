const ALLOWED_SUBTYPES = ['file_share'];

import { openModal } from '../api/slackApi';
import { getModalPayload } from '../utils/slackUtils';

export const handleSlashCommand = async (req, env) => {
  const formData = await req.formData();
  const form = Object.fromEntries(formData.entries());
  const words = form.text.split(' ');

  try {
    await openModal(
      {
        trigger_id: form.trigger_id,
        modal: getModalPayload(words.shift(), words.join(' ')),
      },
      env
    );

    return new Response({ status: 200 });
  } catch (error) {
    return new Response({ status: 400, error });
  }
};
