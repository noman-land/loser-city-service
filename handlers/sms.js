import { postSlackMessage } from '../utils/slackUtils'
import { parseSms } from '../utils/smsUtils'

export const handleSms = async req => {
    const { body, from } = parseSms(req.body)
    const threadId = await LOSERS.get(from)

    if (!threadId) {
        return postSlackMessage({ body, from }).then(async response => {
            const {
                message: { ts },
            } = await response.json()
            await LOSERS.put(from, ts)
            await LOSERS.put(ts, from)
            return response
        })
    }

    return postSlackMessage({ body, from, threadId })
}
