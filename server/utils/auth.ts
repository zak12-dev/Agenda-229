import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({

  baseURL: process.env.BETTER_AUTH_URL!,
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: { 
      clientId: process.env.FACEBOOK_CLIENT_ID!, 
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!, 
    },
  },
  user: {
    additionalFields: {
      roleId: {
        type: "number",
        required: false,
        defaultValue: 3, // Corresponds to 'user simple' in seed
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
      },
    },
  },
})
