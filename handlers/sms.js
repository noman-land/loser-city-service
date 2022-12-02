import { postSlackMessage } from '../api/slackApi';
import { parseSms } from '../utils/smsUtils';
import { saveThread, getThreadTs } from '../utils/sqlUtils';

export const handleSms = async (req, env) => {
  const body = await req.text();
  const { media, phoneNumber, text } = parseSms(body);
  const threadTs = await getThreadTs(phoneNumber, env);

  if (threadTs) {
    return postSlackMessage({ media, phoneNumber, text, threadTs }, env);
  }

  return postSlackMessage({ media, phoneNumber, text }, env).then(
    async (response) => {
      const {
        message: { ts },
      } = await response.json();

      await saveThread({ phoneNumber, threadTs: ts }, env);
      return response;
    }
  );
};
