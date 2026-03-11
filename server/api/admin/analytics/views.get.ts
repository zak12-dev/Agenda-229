// server/api/admin/analytics/views.get.ts

import { prisma } from '~~/server/utils/prisma'
import { auth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const rawHeaders = getRequestHeaders(event)
  const headers: Record<string, string> = {}
  for (const key in rawHeaders) {
    const value = rawHeaders[key]
    if (value) headers[key] = value
  }

  const session = await auth.api.getSession({ headers })
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }

  const roleId = session.user.roleId
  const userId = session.user.id

  if (roleId !== 1 && roleId !== 2) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  try {

    // ── 1. Vues propres à l'utilisateur ────────────────────────────────────────
    // Admin → toutes les vues / Organisateur → ses événements uniquement
    const myViewsWhere = roleId === 1 ? {} : { event: { userId } }

    const myViews = await prisma.eventView.findMany({
      where: myViewsWhere,
      select: {
        id: true,
        eventId: true,
        userId: true,
        visitorId: true,
        createdAt: true,
        source: true,
        country: true,
        city: true,
        device: true,
        referrer: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // ── 2. Stats globales plateforme (pour la comparaison) ────────────────────
    // On ne retourne PAS les données brutes des autres — seulement des agrégats
    // anonymisés pour que l'organisateur puisse se situer.

    // Nombre total de vues sur la plateforme
    const platformTotalViews = await prisma.eventView.count()

    // Nombre total d'événements publiés sur la plateforme
    const platformTotalEvents = await prisma.event.count({
      where: { status: 'PUBLISHED' }
    })

    // Moyenne de vues par événement publié sur la plateforme
    const platformAvgViews = platformTotalEvents > 0
      ? Math.round(platformTotalViews / platformTotalEvents)
      : 0

    // Top 10% : seuil de vues pour être dans le top 10% des événements
    const allEventViews = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      select: { views: true },
      orderBy: { views: 'desc' },
    })

    const top10Index = Math.max(0, Math.floor(allEventViews.length * 0.1) - 1)
    const top10Threshold = allEventViews[top10Index]?.views ?? 0

    const top25Index = Math.max(0, Math.floor(allEventViews.length * 0.25) - 1)
    const top25Threshold = allEventViews[top25Index]?.views ?? 0

    // Vues de cette semaine sur la plateforme (pour tendance globale)
    const now = new Date()
    const d7ago = new Date(now.getTime() - 7 * 864e5)
    const platformViewsThisWeek = await prisma.eventView.count({
      where: { createdAt: { gte: d7ago } }
    })

    // Mes événements publiés
    const myEventsWhere = roleId === 1 ? { status: 'PUBLISHED' as const } : { status: 'PUBLISHED' as const, userId }
    const myPublishedEvents = await prisma.event.findMany({
      where: myEventsWhere,
      select: { id: true, title: true, views: true },
      orderBy: { views: 'desc' },
    })

    // Calcul du percentile de chaque événement dans la plateforme
    const myEventsWithRank = myPublishedEvents.map(ev => {
      const rank = allEventViews.findIndex(e => e.views <= ev.views)
      const percentile = allEventViews.length > 0
        ? Math.round(((allEventViews.length - rank) / allEventViews.length) * 100)
        : 0
      return {
        ...ev,
        percentile,        // ex: 85 = top 15% de la plateforme
        isTop10: ev.views >= top10Threshold,
        isTop25: ev.views >= top25Threshold,
      }
    })

    return {
      // Données brutes pour les graphiques (tendances, sources, geo, devices)
      views: myViews,

      // Stats de comparaison plateforme
      platform: {
        totalViews: platformTotalViews,
        totalEvents: platformTotalEvents,
        avgViews: platformAvgViews,
        top10Threshold,
        top25Threshold,
        viewsThisWeek: platformViewsThisWeek,
      },

      // Mes événements avec leur rang dans la plateforme
      myEventsRanked: myEventsWithRank,
    }

  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des analytics',
    })
  }
})