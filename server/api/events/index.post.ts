import { prisma } from '~~/server/utils/prisma'
import { requireAuth } from '~~/server/utils/protect'
import cloudinary from '../../utils/cloudinary'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Données du formulaire manquantes',
    })
  }

  let title = ''
  let codePrefix = '' 
  let description = ''
  let details = ''
  let location = ''
  let maxUsage: number | null = null
  let eventDate = ''
  let startDate = ''
  let endDate = ''
  let villeId = ''
  let categoryId = ''
  let price = ''
  let entryMode = ''
  let priceType = 'FREE'
  let status = 'DRAFT'
  let imageFiles: any[] = []

  for (const field of formData) {
    if (!field.name) continue

    const value = field.data.toString()

    if (field.name === 'title') title = value
    else if (field.name === 'codePrefix') codePrefix = value
    else if (field.name === 'description') description = value
    else if (field.name === 'details') details = value
    else if (field.name === 'location') location = value
    else if (field.name === 'maxUsage') maxUsage = parseInt(value, 10)
    else if (field.name === 'eventDate') eventDate = value
    else if (field.name === 'startDate') startDate = value
    else if (field.name === 'endDate') endDate = value
    else if (field.name === 'villeId') villeId = value
    else if (field.name === 'categoryId') categoryId = value
    else if (field.name === 'price') price = value
    else if (field.name === 'entryMode') entryMode = value
    else if (field.name === 'priceType') priceType = value
    else if (field.name === 'status') status = value
    else if (field.name === 'image' || field.name === 'images') {
      if (field.filename) {
        imageFiles.push(field)
      }
    }
  }

  // Nettoyage du préfixe
  if (codePrefix) {
    codePrefix = codePrefix
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
  }

  if (status === 'PUBLISHED') {
    if (
      !title ||
      !description ||
      !location ||
      !details ||
      !eventDate ||
      !startDate ||
      !villeId ||
      !categoryId ||
      !codePrefix
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tous les champs obligatoires doivent être remplis',
      })
    }

    // Validation longueur prefix
    if (codePrefix.length < 3) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le préfixe doit contenir au moins 3 caractères',
      })
    }

    if (!maxUsage || maxUsage < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'maxUsage doit être un nombre entier >= 1',
      })
    }
  }

  if (imageFiles.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Au moins une image est requise',
    })
  }

  if (imageFiles.length > 3) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le nombre d'images maximum est de 3",
    })
  }

  let parsedPrice: number | null = null

  if (price && price.trim() !== '') {
    const numericPrice = parseFloat(price)

    if (!isNaN(numericPrice) && numericPrice >= 0) {
      parsedPrice = numericPrice
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le prix doit être un nombre positif',
      })
    }
  }

  if (!['DRAFT', 'PUBLISHED'].includes(status)) {
    status = 'DRAFT'
  }

  if (!['PUBLIC', 'PRIVATE'].includes(entryMode)) {
    entryMode = 'PUBLIC'
  }

  if (!['FREE', 'PAID'].includes(priceType)) {
    priceType = 'FREE'
  }

  try {
    // Vérification unicité prefix
    if (codePrefix) {
      const existingPrefix = await prisma.event.findUnique({
        where: { codePrefix },
      })

      if (existingPrefix) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Ce préfixe est déjà utilisé',
        })
      }
    }

    const imagesUrls: string[] = []

    for (const imageFile of imageFiles) {
      const timestamp = Date.now()
      const safeFilename = (imageFile.filename || 'image').replace(/\s+/g, '_')
      const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1e9)}`
      const uploadResult = await cloudinary.uploader.upload(
        `data:${imageFile.type};base64,${imageFile.data.toString('base64')}`,
        {
          folder: 'blog_posts',
          public_id: `post-${uniqueSuffix}-${safeFilename}`,
        }
      )
      imagesUrls.push(uploadResult.secure_url)
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        codePrefix,
        description,
        details,
        maxUsage: maxUsage ?? undefined,
        location,
        eventDate: new Date(eventDate),
        startDate,
        endDate: endDate || null,
        images: {
          create: imagesUrls.map((url) => ({ url })),
        },
        price: price ? parseFloat(price) : null,
        priceType: priceType as any,
        status: status as any,
        userId: user.id,
        villeId,
        categoryId,
      },
      include: {
        category: true,
        ville: true,
        user: true,
        images: true,
      },
    })

    return {
      message: 'Événement créé avec succès',
      event: newEvent,
    }
  } catch (error) {
    console.error('ERREUR COMPLETE =>', error)
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la creation de l'evenement",
    })
  }
})