import { sendSms } from '../utils/smsUtils'

export const handleSlack = async req => {
    const { text, subtype, thread_ts } = await req.json().event
    const phoneNumber = await LOSERS.get(thread_ts)

    if (!subtype && thread_ts && phoneNumber) {
        return sendSms({ body: text, to: phoneNumber })
    }
}

export const handleSlackChallenge = async req => {
    const { challenge } = await req.json()
    return new Response(challenge)
}
