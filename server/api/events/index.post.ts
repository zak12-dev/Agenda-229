import { prisma } from '~~/server/utils/prisma'
import { requireAuth } from '~~/server/utils/protect'
import cloudinary from '../../utils/cloudinary'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'DonnÃ©es du formulaire manquantes',
    })
  }

  let title = ""
  let description = ""
  let location = ""
  let eventDate = ""
  let startDate = ""
  let endDate = ""
  let villeId = ""
  let categoryId = ""
  let imageFile: any = null

  for (const field of formData) {
    if (!field.name) continue

    const value = field.data.toString()

    if (field.name === "title") title = value
    else if (field.name === "description") description = value
    else if (field.name === "location") location = value
    else if (field.name === "eventDate") eventDate = value
    else if (field.name === "startDate") startDate = value
    else if (field.name === "endDate") endDate = value
    else if (field.name === "villeId") villeId = value
    else if (field.name === "categoryId") categoryId = value
    else if (field.name === "image") imageFile = field
  }

  if (
    !title ||
    !description ||
    !location ||
    !eventDate ||
    !startDate ||
    !imageFile ||
    !villeId ||
    !categoryId
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tous les champs obligatoires doivent Ãªtre remplis',
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
        startDate,
        endDate: endDate || null,
        image: imageUrl,
        userId: user.id,
        villeId,
        categoryId,
      },
      include: {
        category: true,
        ville: true,
        user: true,
      },
    })

    return {
      message: "Ã‰vÃ©nement crÃ©Ã© avec succÃ¨s",
      event: newEvent,
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la crÃ©ation de l'Ã©vÃ©nement",
    })
  }
})
