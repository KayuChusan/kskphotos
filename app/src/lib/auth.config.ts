import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    // allowDangerousEmailAccountLinking: 同一メールの既存 User に Google を後付け連携する。
    // 過去に email サインイン(Credentials)で作られた User 行は Google の Account を持たず、
    // そのままだと OAuthAccountNotLinked で Google ログインが弾かれるため必要。
    // 本サイトは管理者1名のみ + signIn コールバックで email === ADMIN_EMAIL に限定しており、
    // 別プロバイダ経由の成りすまし連携リスクがないため安全。
    Google({ allowDangerousEmailAccountLinking: true }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async authorized({ auth, request }) {
      const isAdmin = request.nextUrl.pathname.startsWith("/admin");
      if (isAdmin && !auth) return false;
      return true;
    },
    async signIn({ user }) {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) return true;
      return user.email === adminEmail;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as unknown as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
