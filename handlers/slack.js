const ALLOWED_SUBTYPES = ['file_share']

import { SUFFIX } from '../constants'
import { sendSms } from '../api/twilioApi'

export const handleSlack = async req => {
    const {
        event: {
            files: [{ url_private_download }] = [{}],
            message = {},
            previous_message = {},
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

    // slackFetch({ contentType: `image/${fileType}`, url: thumb_480 })
    // .then(response =>
    // console.log('response', Buffer.from(response).toString())
    // )
    // .catch(error => console.log(error.message))

    if (
        (!subtype || ALLOWED_SUBTYPES.includes(subtype)) &&
        thread_ts &&
        phoneNumber
    ) {
        return sendSms({
            body: text,
            mediaUrl: url_private_download,
            to: phoneNumber,
        })
    }

    const isBotMessage =
        previous_message.subtype === 'bot_message' &&
        previous_message.username.endsWith(SUFFIX)

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
