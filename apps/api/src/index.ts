import { Hono } from 'hono'
import { urlRoute } from './routes'
import { exampleRoute } from './example'
import '../worker-configuration.d.ts' // for avoiding @repo/extension package type check error

const app = new Hono()

const routes = app.route('/urls', urlRoute).route('/examples', exampleRoute)

export default app
export type AppType = typeof routes
