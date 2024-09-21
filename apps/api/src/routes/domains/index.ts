import { Hono } from 'hono'
import { addHandler } from './add'
import { deleteHandler } from './delete'
import { disableHandler } from './disable'

export const domainRoute = new Hono()
  .post('/add', ...addHandler)
  .post('/delete', ...deleteHandler)
  .post('disable', ...disableHandler)
