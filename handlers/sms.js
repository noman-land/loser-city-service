import { postSlackMessage } from '../api/slackApi'
import { parseSms } from '../utils/smsUtils'

export const handleSms = async request => {
    const { body, from, media } = parseSms(request.body)
    return postSlackMessage({ body, from, media })
}
