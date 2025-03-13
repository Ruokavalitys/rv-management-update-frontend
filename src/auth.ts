import NextAuth, { NextAuthConfig, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

declare module "next-auth" {
	interface User {
		accessToken: string;
		user: {
			userId: number;
			username: string;
			fullName: string;
			email: string;
			role: string;
			moneyBalance: number;
			privacyLevel: number;
		};
	}
}

export const authConfig = {
	pages: {
		signIn: "/",
	},
	trustHost: true,
	session: {
		strategy: "jwt",
		maxAge: 60 * 60, // 1 hour
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isAdminPage = nextUrl.pathname.startsWith("/admin");
			if (isAdminPage) {
				if (isLoggedIn) return true;
				return false;
			} else if (isLoggedIn) {
				return Response.redirect(new URL("/admin", nextUrl));
			}
			return true;
		},
		async session({ session, token }) {
			if (token.user) {
				session.user = token.user as User;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.user = user;
			}
			return token;
		},
	},
	providers: [
		Credentials({
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const parsedCredentials = z
					.object({ username: z.string().min(1), password: z.string().min(1) })
					.safeParse(credentials);

				if (parsedCredentials.success) {
					const authResponse = await fetch(
						`${process.env.RV_BACKEND_URL}/api/v1/authenticate`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(parsedCredentials.data),
						},
					);
					if (!authResponse.ok) {
						return null;
					}

					const user = await authResponse.json();
					return user;
				}

				return null;
			},
		}),
	],
} satisfies NextAuthConfig;

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth(authConfig);
