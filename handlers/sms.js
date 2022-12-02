import { postSlackMessage } from '../api/slackApi';
import { parseSms } from '../utils/smsUtils';
import { createThread, getThreadTs } from '../utils/sqlUtils';

export const handleSms = async (req, env) => {
  const body = await req.text();
  const { media, phoneNumber, text } = parseSms(body);
  const threadTs = await getThreadTs(phoneNumber, env);

  if (threadTs) {
    return postSlackMessage({ media, phoneNumber, text, threadTs }, env);
  }

  return postSlackMessage({ media, phoneNumber, text }, env)
    .then(async (response) => {
      const {
        message: { ts },
      } = await response.json();

      await createThread({ phoneNumber, threadTs: ts }, env);
      return response;
    })
    .catch(console.error);
};
