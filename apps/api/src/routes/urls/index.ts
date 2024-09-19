import { Hono } from 'hono'
import { getUrlsHandler } from './get'
import { checkExistHandler } from './checkExist'
import { addHandler } from './add'
import { deleteHandler } from './delete'

export const urlRoute = new Hono()
  .get('/', ...getUrlsHandler) // Get bookmarked urls
  .post('/exist', ...checkExistHandler) // Confirm Url Registered status
  .post('/add', ...addHandler)
  .post('/delete', ...deleteHandler)
