import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

// Extended user type that includes our custom fields
interface CustomUser extends NextAuthUser {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailVerified?: Date | null;
  image?: string | null;
}

// Add custom properties to the session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      emailVerified?: Date | null;
      image?: string | null;
    };
  }
}

// Add custom properties to JWT
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    emailVerified?: Date | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("User not found");

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordMatch) throw new Error("Incorrect password");

        // Return all necessary user data
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          image: user.image || null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        // Make sure all user data from token is added to the session
        session.user = {
          ...session.user,
          id: token.sub || "",
          name: token.name,
          email: token.email,
          firstName: token.firstName,
          lastName: token.lastName,
          phoneNumber: token.phoneNumber,
          emailVerified: token.emailVerified,
          image: token.picture || null,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        const customUser = user as CustomUser;

        // Add all user properties to the token
        token.name = customUser.name;
        token.email = customUser.email;
        token.firstName = customUser.firstName;
        token.lastName = customUser.lastName;
        token.phoneNumber = customUser.phoneNumber;
        token.emailVerified = customUser.emailVerified;
        token.picture = customUser.image;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
