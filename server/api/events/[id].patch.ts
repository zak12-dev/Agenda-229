import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";
import cloudinary from '../../utils/cloudinary';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de l'événement requis",
    });
  }

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: "Événement non trouvé",
      });
    }

    if (existingEvent.userId !== user.id && user.roleId !== 1) {
      throw createError({
        statusCode: 403,
        statusMessage: "Vous n'êtes pas autorisé à modifier cet événement",
      });
    }

    const contentType = getHeader(event, "content-type") || "";
    let data: any = {};
    let imageFiles: any = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await readMultipartFormData(event);
      if (formData) {
        for (const field of formData) {
          if (!field.name) continue;
          const value = field.data.toString();

          if (field.name === "categoryId") {
            data.categoryId = value;
          } else if (field.name === "image" || field.name === "images") {
            if (field.filename) {
              imageFiles.push(field);
            }
          } else {
            data[field.name] = value;
          }
        }
      }
    } else {
      data = await readBody(event);
    }

    const {
      title,
      description,
      details,
      location,
      eventDate,
      startDate,
      endDate,
      image,
      villeId,
      categoryId,
      price,
      priceType,
      status,
    } = data;

    let imagePath = image;
    const imageUrls: string [] = [];

    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const timestamp = Date.now()
      const safeFilename = (imageFile.filename || 'image').replace(/\s+/g, '_')
      const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1E9)}`
      const uploadResult = await cloudinary.uploader.upload(
        `data:${imageFile.type};base64,${imageFile.data.toString('base64')}`,
        {
          folder: 'events',
          public_id: `event-${uniqueSuffix}-${safeFilename}`,
        }
      )
    imageUrls.push(uploadResult.secure_url)
      }
      imagePath = imageUrls[0];
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        details: details !== undefined ? details : undefined,
        location,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
        image: imagePath,
        images: imageUrls.length > 0 ? {
          create: imageUrls.map(url => ({ url }))
        } : undefined,
        villeId,
        categoryId: categoryId ?? undefined,
        price: price !== undefined ? (price ? parseFloat(price) : null) : undefined,
        priceType: priceType ?? undefined,
        status: status ?? undefined,
      },
      include: {
        category: true,
        ville: true,
        images: true,
      },
    });

    return {
      message: "Événement mis à jour avec succès",
      event: updatedEvent,
    };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la mise à jour de l'événement",
    });
  }
});
