import { toBlocks } from '../utils/slackUtils'

const ONE_HOUR_IN_MS = 1000 * 60 * 60

export const slackFetch = async ({
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

const slackPost = async (url, body = {}) =>
    slackFetch({
        url,
        body: JSON.stringify({
            channel: SLACK_CHANNEL_ID,
            link_names: false,
            unfurl_links: false,
            ...body,
        }),
        headers: {
            authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'content-type': 'application/json; charset=utf-8',
        },
        method: 'POST',
    })

export const postSlackMessage = async ({ body, from, media }) => {
    const threadProps = {}
    const {
        value: threadTs,
        metadata: { lastSeen },
    } = await LOSERS.getWithMetadata(from)

    if (threadTs) {
        threadProps['thread_ts'] = threadTs
        if (Date.now() - lastSeen > ONE_HOUR_IN_MS) {
            // broadcast to the whole channel
            threadProps['reply_broadcast'] = true
        }
    }

    return slackPost('https://slack.com/api/chat.postMessage', {
        blocks: toBlocks({ text: body, media }),
        username: `${from}@loser.city`,
        ...threadProps,
    }).then(async response => {
        const { thread_ts } = response.body.event
        if (!threadTs) {
            await LOSERS.put(thread_ts, from)
        }
        await LOSERS.put(from, thread_ts, {
            lastSeen: Date.now(),
        })
    })
}
