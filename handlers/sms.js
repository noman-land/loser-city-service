import { postSlackMessage } from '../api/slackApi';
import { parseSms } from '../utils/smsUtils';
import { createThread, getThreadTs } from '../utils/sqlUtils';

export const handleSms = async (req, env) => {
  const text = await req.text();
  const { body, from, media } = parseSms(text);
  const threadTs = await getThreadTs(from, env);

  if (!threadTs) {
    return postSlackMessage({ body, from, media }, env).then(
      async (response) => {
        const {
          message: { ts },
        } = await response.json();

      await createThread({ phoneNumber: from, threadTs: ts }, env);
      return response;
    });
  }

  return postSlackMessage({ body, from, media, threadTs }, env);
};
