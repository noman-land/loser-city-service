import { Router } from 'itty-router';

import { handleSlack } from './handlers/slack';
import { handleSlashCommand } from './handlers/slashCommand';
import { handleSms } from './handlers/sms';

const router = new Router({ base: '/fun/v1' });

router
  .cors()
  .get('', () => new Response('OK'))
  .get('/slack', () => new Response('Slack OK'))
  .get('/slash-command', () => new Response('Slash command OK'))
  .get('/sms', () => new Response('SMS OK'))
  .post('/slack', handleSlack)
  .post('/slash-command', handleSlashCommand)
  .post('/sms', handleSms)
  .catch((error) => {
    console.error(error);
    return new Response(error.message || 'Catch inside router has caught!', {
      status: error.status || 404,
    });
  });

export default {
  fetch: router.handle,
};
