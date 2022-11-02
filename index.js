import { Router } from 'itty-router';

import { handleSlack } from './handlers/slack';
import { handleSms } from './handlers/sms';

const router = new Router({ base: '/fun/v1' });

router
  .cors()
  .get('', () => new Response('OK'))
  .get('/slack', () => new Response('Slack OK'))
  .get('/sms', () => new Response('SMS OK'))
  .post('/slack', handleSlack)
  .post('/sms', handleSms);

addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request));
});
