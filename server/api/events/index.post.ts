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
  let description = ''
  let location = ''
  let eventDate = ''
  let startDate = ''
  let endDate = ''
  let villeId = ''
  let categoryIds: string[] = []
  let imageFile: any = null

  for (const field of formData) {
    if (!field.name) continue

    const value = field.data.toString()

    if (field.name === 'title') title = value
    else if (field.name === 'description') description = value
    else if (field.name === 'location') location = value
    else if (field.name === 'eventDate') eventDate = value
    else if (field.name === 'startDate') startDate = value
    else if (field.name === 'endDate') endDate = value
    else if (field.name === 'villeId') villeId = value
    else if (field.name === 'categoryIds') {
      try {
        categoryIds = JSON.parse(value)
      } catch (e) {
        // Si ce n'est pas du JSON, on essaie de le traiter comme une valeur unique
        if (value) categoryIds = [value]
      }
    } else if (field.name === 'image') {
      imageFile = field
    }
  }

  if (!title || !description || !location || !eventDate || !startDate || !imageFile || !villeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tous les champs obligatoires doivent être remplis',
    })
  }

  try {
    // Upload vers Cloudinary
    const timestamp = Date.now()
    const safeFilename = (imageFile.filename || 'image').replace(/\s+/g, '_')
    const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1E9)}`
    const uploadResult = await cloudinary.uploader.upload(
      `data:${imageFile.type};base64,${imageFile.data.toString('base64')}`,
      {
        folder: 'blog_posts',
        public_id: `post-${uniqueSuffix}-${safeFilename}`,
      }
    )

    const imageUrl = uploadResult.secure_url

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        location,
        eventDate: new Date(eventDate),
        startDate, // Désormais une chaîne (ex: "10:00")
        endDate: endDate || null, // Désormais une chaîne ou null
        image: imageUrl,
        userId: user.id,
        villeId,
        categories: {
          create: categoryIds.map((catId: string) => ({
            categoryId: catId,
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        ville: true,
      },
    })

    return {
      message: 'Événement créé avec succès',
      event: newEvent,
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la création de l'événement",
    })
  }
})
