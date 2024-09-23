import { Hono } from 'hono'
import { getUrlsHandler } from './get'
import { addHandler } from './add'
import { deleteHandler } from './delete'

export const urlRoute = new Hono()
  .get('/', ...getUrlsHandler) // Get bookmarked urls
  .post('/add', ...addHandler)
  .post('/delete', ...deleteHandler)
