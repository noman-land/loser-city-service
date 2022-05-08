const toBlocks = ({ mediaUrls, text }) => {
    const media = mediaUrls
        ? mediaUrls.map((url, i) => ({
              alt_text: `MediaUrl${i}`,
              image_url: url,
              type: 'image',
          }))
        : []

    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text,
            },
        },
        ...media,
    ]
}

export const postSlackMessage = async ({ body, from, mediaUrls, threadId }) => {
    const threadProps = threadId
        ? {
              thread_ts: threadId,
              // TODO: Send to channel
              // reply_broadcast: true,
          }
        : {}

    return fetch('https://slack.com/api/chat.postMessage', {
        body: JSON.stringify({
            blocks: toBlocks({ text: body, mediaUrls }),
            channel: SLACK_CHANNEL_ID,
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
