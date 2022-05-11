import { sendSms } from '../api/twilioApi'

const ALLOWED_SUBTYPES = ['file_share']

export const handleSlack = async request => {
    const {
        files: [{ url_private_download }] = [{}],
        subtype,
        text,
        thread_ts,
    } = request.body.event
    const phoneNumber = await LOSERS.get(thread_ts)

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
}
