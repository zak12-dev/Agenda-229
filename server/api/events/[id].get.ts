import { prisma } from "~~/server/utils/prisma";
import { getCookie, setCookie, getRouterParam, createError, getHeader } from "h3";
import { auth } from "~~/server/utils/auth";

function generateVisitorId() {
  return crypto.randomUUID();
}

// ─── Détection appareil depuis User-Agent ─────────────────────────────────────
function detectDevice(ua: string): string {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod|blackberry|opera mini|windows phone/i.test(ua)) return 'mobile'
  return 'desktop'
}

// ─── Détection source depuis Referer ─────────────────────────────────────────
function detectSource(referer: string | null): string {
  if (!referer) return 'DIRECT'
  if (/facebook\.com|fb\.me|fb\.com/i.test(referer)) return 'FACEBOOK'
  if (/whatsapp\.com|wa\.me/i.test(referer)) return 'WHATSAPP'
  if (/instagram\.com/i.test(referer)) return 'INSTAGRAM'
  if (/google\./i.test(referer)) return 'GOOGLE'
  // Si le referer vient du même domaine → trafic interne plateforme
  if (/welovevent|localhost/i.test(referer)) return 'PLATFORM'
  return 'DIRECT'
}

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, "id");

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de l'événement requis",
    });
  }

  // ── Session utilisateur ──────────────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: event.headers });
  const userId = session?.user?.id ?? null;

  // ── Visiteur anonyme ─────────────────────────────────────────────────────────
  let visitorId = getCookie(event, "visitor_id");
  if (!visitorId) {
    visitorId = generateVisitorId();
    setCookie(event, "visitor_id", visitorId, {
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }

  // ── Vérifier si la vue existe déjà ───────────────────────────────────────────
  const existingView = await prisma.eventView.findFirst({
    where: userId
      ? { eventId, userId }
      : { eventId, visitorId },
  });

  // ── Enregistrer la vue si nouvelle ───────────────────────────────────────────
  if (!existingView) {

    // Collecte des métadonnées de la requête
    const userAgent  = getHeader(event, 'user-agent')  ?? ''
    const referer    = getHeader(event, 'referer')     ?? null
    const cfCountry  = getHeader(event, 'cf-ipcountry') ?? null   // header Cloudflare
    const cfCity     = getHeader(event, 'cf-ipcity')    ?? null   // header Cloudflare (si dispo)
    const xForwardedFor = getHeader(event, 'x-forwarded-for') ?? null

    const device = detectDevice(userAgent)
    const source = detectSource(referer)

    // IP brute pour éventuelle géolocalisation future
    const ip = xForwardedFor?.split(',')[0]?.trim() ?? null

    await prisma.$transaction([
      prisma.eventView.create({
        data: {
          eventId,
          userId,
          visitorId: userId ? null : visitorId,
          // ── Données enrichies ──
          source,
          device,
          referrer: referer,
          country:  cfCountry,
          city:     cfCity,
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: { views: { increment: 1 } },
      }),
    ]);
  }

  // ── Récupérer l'événement ─────────────────────────────────────────────────────
  // ⚠️  PARTIE NON MODIFIÉE — identique à l'original
  const eventData = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      ville: true,
      category: true,
      images: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          organizerProfile: {
            select: {
              name: true,
              logo: true,
              phone: true,
              website: true,
            },
          },
        },
      },
    },
  });

  if (!eventData) {
    throw createError({
      statusCode: 404,
      statusMessage: "Événement non trouvé",
    });
  }

  // ── Événements similaires ─────────────────────────────────────────────────────
  // ⚠️  PARTIE NON MODIFIÉE — identique à l'original
  const similarEvents = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: eventData.categoryId,
      NOT: { id: eventId },
    },
    include: {
      category: true,
      images: true,
    },
    take: 3,
    orderBy: { eventDate: "asc" },
  });

  return { ...eventData, similarEvents };
});