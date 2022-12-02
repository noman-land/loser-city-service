const getTwilioUrl = (TWILIO_ACCOUNT_SID) =>
  `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

const getToken = (env) =>
  Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString(
    'base64'
  );

const twilioSms = (messageParams, env) =>
  fetch(getTwilioUrl(env.TWILIO_ACCOUNT_SID), {
    body: new URLSearchParams({
      ...messageParams,
      MessagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID,
    }).toString(),
    headers: {
      authorization: `Basic ${getToken(env)}`,
      'content-type': 'application/x-www-form-urlencoded', // ; charset=utf-8
    },
    method: 'POST',
  });

export const sendSms = async ({ body, mediaUrl, to }, env) => {
  const maybeParams = mediaUrl
    ? {
        MediaUrl: encodeURIComponent(mediaUrl),
      }
    : {};

  return twilioSms(
    {
      Body: body,
      To: to,
      ...maybeParams,
    },
    env
  );
};
