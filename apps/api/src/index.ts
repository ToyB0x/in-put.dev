import { Hono } from 'hono'
import { domainRoute, urlRoute } from './routes'
import '../worker-configuration.d.ts' // for avoiding @repo/extension package type check error

const app = new Hono()

const routes = app.route('/domains', domainRoute).route('/urls', urlRoute)

export default app
export type AppType = typeof routes
