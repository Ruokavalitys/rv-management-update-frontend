// auth.ts
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
		signOut: "/",
	},
	trustHost: true,
	session: {
		strategy: "jwt",
		maxAge: 60 * 60, // 1 hour
	},
	callbacks: {
		signIn: async ({ user }) => {
			const userRole = user?.user?.role;
			if (userRole === "INACTIVE") {
				return false;
			}
			return true;
		},
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isAdminPage = nextUrl.pathname.startsWith("/admin");
			const isProductsPage = nextUrl.pathname.startsWith("/products");
			const isUsersPage = nextUrl.pathname.startsWith("/users");
			const isUserProfilePage = nextUrl.pathname.match(/^\/\d+$/);
			const userRole = auth?.user?.user?.role;

			if (isAdminPage) {
				if (isLoggedIn && userRole === "ADMIN") {
					return true;
				}
				return false;
			}

			if (isProductsPage || isUsersPage || isUserProfilePage) {
				if (isLoggedIn && (userRole === "USER1" || userRole === "USER2")) {
					return true;
				}
				return false;
			}

			if (isLoggedIn) {
				if (userRole === "USER1" || userRole === "USER2") {
					return Response.redirect(new URL("/products", nextUrl));
				} else if (userRole === "ADMIN") {
					return Response.redirect(new URL("/admin", nextUrl));
				}
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
					const responseBody = await authResponse.text();
					if (!authResponse.ok) {
						return null;
					}

					const user = JSON.parse(responseBody);
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
