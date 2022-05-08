import { postSlackMessage } from '../utils/slackUtils'
import { parseSms } from '../utils/smsUtils'

export const handleSms = async req => {
    const { body, from, mediaUrl } = parseSms(req.body)
    const threadId = await LOSERS.get(from)

    const bodyWithMedia = mediaUrl ? `${body} ${mediaUrl}` : body

    if (!threadId) {
        return postSlackMessage({ body: bodyWithMedia, from }).then(
            async response => {
                const {
                    message: { ts },
                } = await response.json()
                await LOSERS.put(from, ts)
                await LOSERS.put(ts, from)
                return response
            }
        )
    }

    return postSlackMessage({ body: bodyWithMedia, from, threadId })
}
