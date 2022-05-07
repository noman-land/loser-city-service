export const parseSms = str => {
    const { Body, From } = str
        .split('&')
        .flatMap(n => n.split('='))
        .reduce((accum, curr, i, list) => {
            if (i % 2) {
                accum[list[i - 1]] = curr
            }
            return accum
        }, {})

    return {
        body: decodeURIComponent(Body)
            .split('+')
            .join(' '),
        from: decodeURIComponent(From),
    }
}

export const sendSms = async ({ body, to }) => {
    const token = Buffer.from(
        `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
    ).toString('base64')

    return fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
            body: new URLSearchParams({
                Body: body,
                MessagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
                To: to,
            }).toString(),
            headers: {
                authorization: `Basic ${token}`,
                'content-type': 'application/x-www-form-urlencoded', // ; charset=utf-8
            },
            method: 'POST',
        }
    )
}
