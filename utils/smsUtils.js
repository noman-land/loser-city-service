export const parseSms = str => {
    const { Body, From, NumMedia, ...rest } = str
        .split('&')
        .flatMap(n => n.split('='))
        .reduce((accum, curr, i, list) => {
            if (i % 2) {
                accum[list[i - 1]] = curr
            }
            return accum
        }, {})

    const media = Array.from(new Array(parseInt(NumMedia, 10))).map((_, i) => ({
        mediaType: decodeURIComponent(rest[`MediaContentType${i}`]),
        url: decodeURIComponent(rest[`MediaUrl${i}`]),
    }))

    return {
        body: decodeURIComponent(Body)
            .split('+')
            .join(' '),
        from: decodeURIComponent(From),
        media,
    }
}

export const sendSms = async ({ body, mediaUrl, to }) => {
    const token = Buffer.from(
        `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
    ).toString('base64')

    const maybeParams = mediaUrl
        ? {
              MediaUrl: mediaUrl,
          }
        : {}

    return fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
            body: new URLSearchParams({
                Body: body,
                MessagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
                To: to,
                ...maybeParams,
            }).toString(),
            headers: {
                authorization: `Basic ${token}`,
                'content-type': 'application/x-www-form-urlencoded', // ; charset=utf-8
            },
            method: 'POST',
        }
    )
}
