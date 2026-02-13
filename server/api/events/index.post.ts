import { prisma } from "~~/server/utils/prisma";
// import { requireAuth } from "~~/server/utils/protect";
import { requireOrganizer } from "~~/server/utils/protect";
import cloudinary from '../../utils/cloudinary'

export default defineEventHandler(async (event) => {
  const user = requireOrganizer(event);
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: "Données du formulaire manquantes",
    });
  }

  let title = "";
  let description = "";
  let details = "";
  let location = "";
  let eventDate = "";
  let startDate = "";
  let endDate = "";
  let villeId = "";
  let categoryId = "";
  let price = "";
  let priceType = "FREE";
  let status = "DRAFT";
  let imageFiles: any[] = [];

  for (const field of formData) {
    if (!field.name) continue;

    const value = field.data.toString();

    if (field.name === "title") title = value;
    else if (field.name === "description") description = value;
    else if (field.name === "details") details = value;
    else if (field.name === "location") location = value;
    else if (field.name === "eventDate") eventDate = value;
    else if (field.name === "startDate") startDate = value;
    else if (field.name === "endDate") endDate = value;
    else if (field.name === "villeId") villeId = value;
    else if (field.name === "categoryId") categoryId = value;
    else if (field.name === "price") price = value;
    else if (field.name === "priceType") priceType = value;
    else if (field.name === "status") status = value;
    else if (field.name === "image" || field.name === "images") {
      if (field.filename) {
        imageFiles.push(field);
      }
    }
  }

  if (
    !title ||
    !description ||
    !location ||
    !eventDate ||
    !startDate ||
    imageFiles.length === 0 ||
    !villeId ||
    !categoryId
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tous les champs obligatoires doivent être remplis",
    });
  }

  try {
    // Sauvegarde des images
    const imagesUrls: string[] = [];

    for (const imageFile of imageFiles){
      const timestamp = Date.now();
      const safeFilename = (imageFile.filename || 'image').replace(/\s+/g, '_');
      const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1E9)}`;
      const uploadResult = await cloudinary.uploader.upload(
        `data:${imageFile.type};base64,${imageFile.data.toString('base64')}`,
        {
          folder: 'blog_posts',
          public_id: `post-${uniqueSuffix}-${safeFilename}`,
          }
        );
       imagesUrls.push(uploadResult.secure_url);
    }
    
        const newEvent = await prisma.event.create({
          data: {
            title,
            description,
            details,
            location,
            eventDate: new Date(eventDate),
            startDate,
            endDate: endDate || null,
            image: imagesUrls[0],
            images: {
              create: imagesUrls.map(url => ({ url }))
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
    