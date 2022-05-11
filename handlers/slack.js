import { slackGet } from '../api/slackApi'
import { sendSms } from '../api/twilioApi'

const ALLOWED_SUBTYPES = ['file_share']

export const handleSlack = async request => {
    const {
        files: [{ thumb_480 }] = [{}],
        subtype,
        text,
        thread_ts,
    } = request.body.event
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
}
