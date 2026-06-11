import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            name: "Dev Admin",
            credentials: {
              email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
              const email = credentials?.email as string | undefined;
              if (!email) return null;
              const adminEmail = process.env.ADMIN_EMAIL;
              if (adminEmail && email !== adminEmail) return null;
              let user = await prisma.user.findUnique({ where: { email } });
              if (!user) {
                user = await prisma.user.create({
                  data: { email, name: "Dev Admin" },
                });
              }
              return user;
            },
          }),
        ]
      : []),
  ],
});
