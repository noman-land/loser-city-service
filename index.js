import Router from '@tsndr/cloudflare-worker-router'

import { handleSlack } from './handlers/slack'
import { handleSms } from './handlers/sms'

const router = new Router()

router
    .cors()
    .get('', (_, res) => (res.body = 'OK'))
    .get('/slack', (_, res) => (res.body = 'slack'))
    .get('/sms', (_, res) => (res.body = 'sms'))
    .post('/slack', handleSlack)
    .post('/sms', handleSms)

addEventListener('fetch', event => {
    console.log(event.request)
    event.respondWith(router.handle(event.request))
})
