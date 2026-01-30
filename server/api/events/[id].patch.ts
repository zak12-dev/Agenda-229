import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de l'événement requis",
    });
  }

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id }
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

    // Gestion du multipart ou du JSON
    const contentType = getHeader(event, 'content-type') || '';
    let data: any = {};
    let imageFile: any = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await readMultipartFormData(event);
      if (formData) {
        for (const field of formData) {
          if (!field.name) continue;
          const value = field.data.toString();
          if (field.name === 'categoryIds') {
            try { data.categoryIds = JSON.parse(value); } catch { data.categoryIds = [value]; }
          } else if (field.name === 'image') {
            imageFile = field;
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
      location,
      eventDate,
      startDate,
      endDate,
      image,
      villeId,
      categoryIds
    } = data;

    let imagePath = image;
    if (imageFile && imageFile.filename) {
      const fileName = `${Date.now()}-${imageFile.filename}`;
      await useStorage('uploads').setItemRaw(fileName, imageFile.data);
      imagePath = `/uploads/${fileName}`;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        location,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        startDate: startDate !== undefined ? startDate : undefined,
        endDate: endDate !== undefined ? endDate : undefined,
        image: imagePath,
        villeId,
        categories: categoryIds ? {
          deleteMany: {},
          create: categoryIds.map((catId: string) => ({
            categoryId: catId
          }))
        } : undefined
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        ville: true
      }
    });

    return {
      message: "Événement mis à jour avec succès",
      event: updatedEvent
    };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la mise à jour de l'événement",
    });
  }
});
