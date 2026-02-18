export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const verify: any = await $fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: {
        secret: config.turnstileSecret,
        response: body.token
      }
    }
  )

  if (!verify.success) {
    throw createError({
      statusCode: 400,
      message: "Validation de sécurité échouée"
    })
  }

  return { success: true }
})
