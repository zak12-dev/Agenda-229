import { prisma } from "~~/server/utils/prisma"
import { auth } from "../../../server/utils/auth" 

export default defineEventHandler(async (event) => {
  try {
    // 1️⃣ récupérer headers et filtrer undefined
    const rawHeaders = getRequestHeaders(event)
    const headers: Record<string, string> = {}

    for (const key in rawHeaders) {
      const value = rawHeaders[key]
      if (value) headers[key] = value
    }

    // 2️⃣ récupérer session Better Auth
    const session = await auth.api.getSession({ headers })

    if (!session?.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Non autorisé",
      })
    }

    const userId = session.user.id
    const roleId = session.user.roleId

    let whereCondition: any = {}

    if (roleId === 1) {
      // ADMIN → tous les events
      whereCondition = {}
    } else if (roleId === 2) {
      // ORGANISATEUR → ses events
      whereCondition = { userId }
    } else {
      // AUTRES → rien
      return []
    }

    const events = await prisma.event.findMany({
      where: whereCondition,
      include: {
        ville: true,
        category: true,

        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    //  console.log("EVENTS:", events);
    return events;
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la récupération des événements",
    })
  }
})