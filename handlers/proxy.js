import { slackGet } from '../api/slackApi'

export const handleProxy = async (request, response) => {
    const url = new URL(decodeURIComponent(request.query.i))
    const [, fileType] = url.pathname.split('.')
    return slackGet({ contentType: `image/${fileType}`, url })
        .then(res => {
            response.body = JSON.stringify(res.body, null, 2)
        })
        .catch(e => console.error(e.message))
}
