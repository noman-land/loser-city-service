import { sendSms } from '../utils/smsUtils'

export const handleSlack = async req => {
    const {
        event: {
            message = {},
            previous_message: {},
            subtype,
            text,
            thread_ts,
            ...eventRest
        },
        ...requestRest
    } = await req.json()

    console.log({
        ...requestRest,
        event: {
            message,
            previous_message,
            subtype,
            text,
            thread_ts,
            ...eventRest,
        },
    })

    const phoneNumber = await LOSERS.get(thread_ts)

    // Thread reply by a Slack user
    if (!subtype && thread_ts && phoneNumber) {
        return sendSms({ body: text, to: phoneNumber })
    }

    const isBotMessage =
        previous_message.subtype === 'bot_message' &&
        previous_message.username.endsWith('@loser.city')

    const isThreadDeleted =
        subtype === 'message_changed' &&
        message.subtype === 'tombstone' &&
        previous_message.thread_ts

    const isNonThreadDeleted =
        subtype === 'message_deleted' && !previous_message.thread_ts

    // Parent thread being deleted
    if (isBotMessage && (isThreadDeleted || isNonThreadDeleted)) {
        const phoneNumber = await LOSERS.get(previous_message.ts)

        await Promise.all([
            LOSERS.delete(phoneNumber),
            LOSERS.delete(previous_message.ts),
        ])

        return new Response({ status: 200 })
    }

    return new Response({ status: 204 })
}

export const handleSlackChallenge = async req => {
    const { challenge } = await req.json()
    return new Response(challenge)
}
