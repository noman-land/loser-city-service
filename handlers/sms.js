import { postSlackMessage } from '../api/slackApi';
import { parseSms } from '../utils/smsUtils';
import { saveThread, getLoser } from '../utils/sqlUtils';

export const handleSms = async (req, env) => {
  const body = await req.text();
  const { media, phoneNumber, text } = parseSms(body);
  const { name, threadTs } = await getLoser(phoneNumber, env);

  const currentName = name || phoneNumber;

  if (threadTs) {
    return postSlackMessage({ media, name: currentName, text, threadTs }, env);
  }

  return postSlackMessage({ media, name: currentName, text }, env).then(
    async (response) => {
      const {
        message: { ts },
      } = await response.json();

      await saveThread({ phoneNumber, threadTs: ts }, env);
      return response;
    }
  );
};
