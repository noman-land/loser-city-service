import { sendSms } from '../utils/smsUtils'

export const handleSlack = async req => {
    const { text, subtype, thread_ts } = req.body.event
    const phoneNumber = await LOSERS.get(thread_ts)

    if (!subtype && thread_ts && phoneNumber) {
        return sendSms({ body: text, to: phoneNumber })
    }
}
