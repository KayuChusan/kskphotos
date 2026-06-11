import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

// 本番では ALLOW_EMAIL_SIGNIN=true のときのみ有効。
// パスワードなしのため ADMIN_EMAIL を知っていれば誰でも入れる — Google ログインの
// 一時的な代替であり、不要になったら環境変数を false に戻すこと。
export const emailSignInEnabled =
  process.env.NODE_ENV === "development" ||
  process.env.ALLOW_EMAIL_SIGNIN === "true";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    ...(emailSignInEnabled
      ? [
          Credentials({
            name: "Admin Email",
            credentials: {
              email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
              const email = credentials?.email as string | undefined;
              if (!email) return null;
              const adminEmail = process.env.ADMIN_EMAIL;
              // 本番では ADMIN_EMAIL 未設定なら拒否(開発時のみ任意メールを許可)
              if (process.env.NODE_ENV !== "development" && !adminEmail)
                return null;
              if (adminEmail && email !== adminEmail) return null;
              let user = await prisma.user.findUnique({ where: { email } });
              if (!user) {
                user = await prisma.user.create({
                  data: { email, name: "Admin" },
                });
              }
              return user;
            },
          }),
        ]
      : []),
  ],
});
