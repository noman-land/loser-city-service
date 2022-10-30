const TWILIO_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

const token = Buffer.from(
  `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
).toString('base64');

const twilioSms = body =>
  fetch(TWILIO_URL, {
    body: new URLSearchParams({
      ...body,
      MessagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
    }).toString(),
    headers: {
      authorization: `Basic ${token}`,
      'content-type': 'application/x-www-form-urlencoded', // ; charset=utf-8
    },
    method: 'POST',
  });

export const sendSms = async ({ body, mediaUrl, to }) => {
  const maybeParams = mediaUrl
    ? {
        MediaUrl: encodeURIComponent(mediaUrl),
      }
    : {};

  return twilioSms({
    Body: body,
    To: to,
    ...maybeParams,
  });
};
