import { sendSms } from '../utils/smsUtils'

export const handleSlack = async req => {
    const {
        event: { text, subtype, thread_ts, ...eventRest },
        ...requestRest
    } = await req.json()

    console.log({
        ...requestRest,
        event: { text, subtype, thread_ts, ...eventRest },
    })

    const phoneNumber = await LOSERS.get(thread_ts)

    if (!subtype && thread_ts && phoneNumber) {
        return sendSms({ body: text, to: phoneNumber })
    }

    return new Response({ status: 204 })
}

export const handleSlackChallenge = async req => {
    const { challenge } = await req.json()
    return new Response(challenge)
}
