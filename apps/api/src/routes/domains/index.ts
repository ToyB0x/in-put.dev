import { Hono } from 'hono'
import { addHandler } from './add'
import { deleteHandler } from './delete'
import { disableHandler } from './disable'
import { getHandler } from './get'

export const domainRoute = new Hono()
  .get('/', ...getHandler)
  .post('/add', ...addHandler)
  .post('/delete', ...deleteHandler)
  .post('disable', ...disableHandler)
