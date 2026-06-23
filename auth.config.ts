import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no DB/bcrypt). Used by middleware + spread into full auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.uid = (user as { id?: string }).id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.uid) (session.user as { id?: string }).id = token.uid as string;
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
