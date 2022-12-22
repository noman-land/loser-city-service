import { postSlackMessage } from '../api/slackApi';
import { parseSms } from '../utils/smsUtils';
import { getLoser, insertThread, setThreadTs } from '../utils/sqlUtils';

export const handleSms = async (req, env) => {
  const body = await req.text();
  const { from, media, text } = parseSms(body);
  const {
    blocked,
    name: currentName,
    phoneNumber: knownLoser,
    threadTs,
  } = await getLoser(from, env);

  if (blocked) {
    return new Response("You've been blocked.", { status: 403 });
  }

  const name = currentName || from;

  if (threadTs) {
    await postSlackMessage({ media, name, text, threadTs }, env);
    return new Response(null, { status: 200 });
  }

  const {
    message: { ts: newThreadTs },
  } = await postSlackMessage({ media, name, text }, env).then((r) => r.json());

  const dbAction = knownLoser ? setThreadTs : insertThread;
  await dbAction({ phoneNumber: from, threadTs: newThreadTs }, env);

  return new Response(null, { status: 200 });
};
