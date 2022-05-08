const toBlocks = ({ mediaUrl, text }) => {
    const images = mediaUrl
        ? [
              {
                  alt_text: text,
                  image_url: mediaUrl,
                  type: 'image',
              },
          ]
        : []

    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text,
            },
        },
        ...images,
    ]
}

export const postSlackMessage = async ({ body, from, mediaUrl, threadId }) => {
    const threadProps = threadId
        ? {
              thread_ts: threadId,
              // TODO: Send to channel
              // reply_broadcast: true,
          }
        : {}

    return fetch('https://slack.com/api/chat.postMessage', {
        body: JSON.stringify({
            blocks: toBlocks({ text: body, mediaUrl }),
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
