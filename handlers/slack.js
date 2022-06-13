import { slackGet } from '../api/slackApi'
import { sendSms } from '../api/twilioApi'

export const handleSlack = async req => {
    const {
        event: {
            files: [{ thumb_480 }] = [{}],
            subtype, text, thread_ts
        },
    } = await req.json()


    const phoneNumber = await LOSERS.get(thread_ts)

    console.log(request.body.event)

    // slackGet({ contentType: `image/${fileType}`, url: thumb_480 })
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
            // mediaUrl: thumb_480,
            to: phoneNumber,
        })
    }

    return new Response({ status: 204 })
}

export const handleSlackChallenge = async req => {
    const { challenge } = await req.json()
    return new Response(challenge)
}
