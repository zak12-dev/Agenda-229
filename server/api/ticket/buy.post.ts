import { buyTicket } from '../../modules/ticket/services/createTicket'
import { createError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const quantity = body.quantity || 1

  if (!user) {
    throw createError({ statusCode: 401, message: "Non autorisé" })
  }

  if (!body.eventId) {
    throw createError({ statusCode: 400, message: "eventId requis" })
  }

  return await buyTicket(user, body.eventId, quantity)
})