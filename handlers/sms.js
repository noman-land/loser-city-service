import { postSlackMessage } from '../api/slackApi';
import { parseSms } from '../utils/smsUtils';
import { createThread, getThreadTs } from '../utils/sqlUtils';

export const handleSms = async (req, env) => {
  const text = await req.text();
  const { body, from, media } = parseSms(text);
  console.log('handlesms from:', from);
  const threadTs = await getThreadTs(from, env);
  console.log('handlesms:', threadTs);

  if (!threadTs) {
    return postSlackMessage({ body, from, media }, env).then(
      async (response) => {
        const {
          message: { ts },
        } = await response.json();

        await createThread({ phoneNumber: from, threadTs: ts }, env);
        // await env.LOSERS.put(from, ts);
        // await env.LOSERS.put(ts, from);
        return response;
      }
    );
  }

  return postSlackMessage({ body, from, media, threadTs }, env);
};
