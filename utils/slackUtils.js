const toBlocks = text => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text,
        },
    },
]

export const postSlackMessage = async ({ body, from, threadId }) => {
    const threadProps = threadId
        ? {
              thread_ts: threadId,
              // TODO: Send to channel
              // reply_broadcast: true,
          }
        : {}

    return fetch('https://slack.com/api/chat.postMessage', {
        body: JSON.stringify({
            blocks: toBlocks(body),
            channel: SLACK_CHANNEL_ID,
            icon_emoji: ':thumbsdown:',
            link_names: false,
            username: `${from}@loser.city`,
            unfurl_links: false,
            ...threadProps,
        }),
        headers: {
            authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'content-type': 'application/json; charset=utf-8',
        },
        method: 'POST',
    })
}
