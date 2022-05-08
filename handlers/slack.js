import { sendSms } from '../utils/smsUtils'

export const handleSlack = async req => {
    const {
        files: [{ thumb_480 }] = [{}],
        subtype,
        text,
        thread_ts,
    } = req.body.event
    const phoneNumber = await LOSERS.get(thread_ts)

    if (!subtype && thread_ts && phoneNumber) {
        return sendSms({ body: text, mediaUrl: thumb_480, to: phoneNumber })
    }
}
