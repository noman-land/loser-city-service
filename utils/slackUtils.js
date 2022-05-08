const createMediaObject = ({ mediaType, url }, i) => {
    const [type] = mediaType.split('/')
    const defaultProps = {
        alt_text: `MediaUrl${i}`,
        type,
    }

    if (type === 'image') {
        return {
            ...defaultProps,
            image_url: url,
        }
    }

    // TODO: Figure out why video isn't working.
    //       It isn't documented: https://api.slack.com/block-kit
    //       But this URL nags you into the right object shape
    //       by telling you which required fields are missing
    //       https://app.slack.com/block-kit-builder/{TEAM_ID}#%7B%22blocks%22:%5B%7B%22type%22:%22video%22,%22thumbnail_url%22:%22https://i1.wp.com/thetempest.co/wp-content/uploads/2017/08/The-wise-words-of-Michael-Scott-Imgur-2.mp4%22,%22title%22:%7B%22type%22:%22plain_text%22,%22text%22:%22why%22%7D,%22alt_text%22:%22inspiration%22%7D%5D%7D
    //
    // if (type === 'video') {
    //     return {
    //         ...defaultProps,
    //         video_url: url,
    //         thumbnail_url:
    //             'https://cdn.pixabay.com/photo/2017/05/09/10/03/play-2297762__180.png',
    //         title: {
    //             type: 'plain_text',
    //             text: `MediaUrl${i}`,
    //         },
    //     }
    // }

    return null
}

const toBlocks = ({ media, text }) => {
    const mediaObjects = media
        ? media.map(createMediaObject).filter(n => n)
        : []

    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text,
            },
        },
        ...mediaObjects,
    ]
}

export const postSlackMessage = async ({ body, from, media, threadId }) => {
    const threadProps = threadId
        ? {
              thread_ts: threadId,
              // TODO: Send to channel
              // reply_broadcast: true,
          }
        : {}

    return fetch('https://slack.com/api/chat.postMessage', {
        body: JSON.stringify({
            blocks: toBlocks({ text: body, media }),
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
