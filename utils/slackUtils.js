import { getLoser } from './sqlUtils';

export const makeSendMessageModalPayload = (
  phoneNumber = '',
  message = ''
) => ({
  type: 'modal',
  callback_id: 'send-message-modal',
  title: {
    type: 'plain_text',
    text: 'Text a loser',
    emoji: true,
  },
  submit: {
    type: 'plain_text',
    text: 'Send text',
    emoji: true,
  },
  close: {
    type: 'plain_text',
    text: 'Cancel',
    emoji: true,
  },
  blocks: [
    {
      block_id: 'phoneNumber',
      type: 'input',
      element: {
        type: 'plain_text_input',
        action_id: 'phoneNumberAction',
        initial_value: phoneNumber,
      },
      label: {
        type: 'plain_text',
        text: 'What phone number would you like to text?',
        emoji: true,
      },
      hint: {
        type: 'plain_text',
        text: 'Example: +13015551234',
      },
    },
    {
      block_id: 'message',
      type: 'input',
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'messageAction',
        initial_value: message,
      },
      label: {
        type: 'plain_text',
        text: 'Message',
        emoji: true,
      },
    },
  ],
});

const makeRenameModalPayload = ({ name, phoneNumber }) => ({
  type: 'modal',
  callback_id: 'rename-modal',
  private_metadata: phoneNumber,
  title: {
    type: 'plain_text',
    text: `Rename ${name || phoneNumber}`,
    emoji: true,
  },
  submit: {
    type: 'plain_text',
    text: 'Rename',
    emoji: true,
  },
  close: {
    type: 'plain_text',
    text: 'Cancel',
    emoji: true,
  },
  blocks: [
    {
      block_id: 'name',
      type: 'input',
      element: {
        type: 'plain_text_input',
        action_id: 'nameAction',
        initial_value: name || phoneNumber,
      },
      label: {
        type: 'plain_text',
        text: 'Choose a new name',
        emoji: true,
      },
    },
  ],
});

const makeBlockModalPayload = ({ name, phoneNumber }) => ({
  type: 'modal',
  callback_id: 'block-modal',
  private_metadata: phoneNumber,
  title: {
    type: 'plain_text',
    text: `Block ${name || phoneNumber}`,
    emoji: true,
  },
  submit: {
    type: 'plain_text',
    text: 'Block',
    emoji: true,
  },
  close: {
    type: 'plain_text',
    text: 'Cancel',
    emoji: true,
  },
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Are you sure you'd like to block *${name || phoneNumber}${
          name ? ` (${phoneNumber})` : ''
        }* from sending texts to loser.city?`,
      },
    },
  ],
});

export const makeModalPayload = async ({ modalType, threadTs }, env) => {
  const { name, phoneNumber } = await getLoser(threadTs, env);

  if (modalType === 'rename') {
    return makeRenameModalPayload({ name, phoneNumber });
  }

  if (modalType === 'block') {
    return makeBlockModalPayload({ name, phoneNumber });
  }

  return null;
};

const createMediaObject = ({ mediaType, url }, i) => {
  const [type] = mediaType.split('/');
  const defaultProps = {
    alt_text: `MediaUrl${i}`,
    type,
  };

  if (type === 'image') {
    return {
      ...defaultProps,
      image_url: url,
    };
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

  return null;
};

const overflowMenu = {
  accessory: {
    type: 'overflow',
    options: [
      {
        text: {
          type: 'plain_text',
          text: ':pencil: Rename loser',
          emoji: true,
        },
        value: 'rename',
      },
      {
        text: {
          type: 'plain_text',
          text: ':no_entry_sign: Block loser',
          emoji: true,
        },
        value: 'block',
      },
    ],
    action_id: 'thread-action',
  },
};

export const makeMessageSections = ({ isThread, media, text }) => {
  const mediaObjects = media
    ? media.map(createMediaObject).filter((n) => n)
    : [];

  const overflow = isThread ? {} : overflowMenu;

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
      ...overflow,
    },
    ...mediaObjects,
  ];
};
