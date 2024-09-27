import { Hono } from 'hono'
import { addHandler } from './add'
import { deleteHandler } from './delete'
import { disableHandler } from './disable'
import { getEnabledHandler } from './getEnabled'

export const domainRoute = new Hono()
  .get('/enabled-domains', ...getEnabledHandler)
  .post('/add', ...addHandler)
  .post('/delete', ...deleteHandler)
  .post('/disable', ...disableHandler)
