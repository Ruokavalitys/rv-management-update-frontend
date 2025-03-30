"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
	prevState: string | undefined,
	formData: FormData,
) {
	try {
		await signIn("credentials", formData, { redirect: false });
		return undefined;
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return "Invalid Login.";
				case "CallbackRouteError":
					if (error.cause?.err?.message === "Signin denied") {
						return "Account is inactive. Please contact an administrator.";
					}
					return "Login failed. Please try again.";
				default:
					return "Something went wrong.";
			}
		}
		throw error;
	}
}
