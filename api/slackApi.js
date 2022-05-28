import { toBlocks } from '../utils/slackUtils'

const slackFetch = async ({
    body,
    contentType = 'application/json; charset=utf-8',
    method = 'GET',
    url,
}) =>
    fetch(url, {
        body,
        headers: {
            authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'content-type': contentType,
        },
        method,
    })

export const slackGet = async ({ contentType, url }) =>
    slackFetch({ contentType, url })

const slackPost = async (url, body = {}) =>
    slackFetch({
        url,
        body: JSON.stringify({
            channel: SLACK_CHANNEL_ID,
            link_names: false,
            unfurl_links: false,
            ...body,
        }),
        method: 'POST',
    })

export const postSlackMessage = async ({ body, from, media }) => {
    const threadProps = {}
    const { value: threadTs } = await LOSERS.get(from)

    if (threadTs) {
        threadProps['thread_ts'] = threadTs
        // threadProps['reply_broadcast'] = true
    }

    return slackPost('https://slack.com/api/chat.postMessage', {
        blocks: toBlocks({ text: body, media }),
        username: `${from}@loser.city`,
        ...threadProps,
    }).then(async response => {
        const { thread_ts } = response.body.event
        if (!threadTs) {
            await LOSERS.put(thread_ts, from)
            await LOSERS.put(from, thread_ts)
        }
    })
}
