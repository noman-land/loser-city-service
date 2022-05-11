import Router from '@tsndr/cloudflare-worker-router'

import { handleSlack } from './handlers/slack'
import { handleSms } from './handlers/sms'
import { handleProxy } from './handlers/proxy'

const router = new Router()

router
    .cors()
    .get('', (_, res) => (res.body = 'OK'))
    .get('/proxy', handleProxy)
    .get('/slack', (_, res) => (res.body = 'slack'))
    .get('/sms', (_, res) => (res.body = 'sms'))
    .post('/slack', handleSlack)
    .post('/sms', handleSms)

addEventListener('fetch', event => {
    event.respondWith(router.handle(event.request))
})
