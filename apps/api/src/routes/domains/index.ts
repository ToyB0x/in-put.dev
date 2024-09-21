import { Hono } from 'hono'
import { addHandler } from './add'
import { deleteHandler } from './delete'

export const domainRoute = new Hono().post('/add', ...addHandler).post('/delete', ...deleteHandler)
