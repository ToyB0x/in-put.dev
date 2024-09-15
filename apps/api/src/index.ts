import { Hono } from 'hono'
import { urlRoute } from './url'
import { exampleRoute } from './example'

const app = new Hono()

const routes = app.route('/urls', urlRoute).route('/examples', exampleRoute)

export default app
export type AppType = typeof routes
