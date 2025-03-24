"use server";

import { auth } from "@/auth";
import { authenticated } from "../wrappers";
import { Deposit, Purchase } from "./historyRequests";
import { QueryKeys } from "./queryKeys";
import { UserRole } from "./types";

const adminTargetUrl = "api/v1/admin/users";
const userTargetUrl = "api/v1/user";

export type getAllUsersResponse = {
	users: [
		{
			userId: number;
			username: string;
			fullName: string;
			email: string;
			moneyBalance: number;
			role: UserRole;
		},
	];
};

export type User = getAllUsersResponse["users"][number];

export async function getAllUsers() {
	"use server";

	return await authenticated<getAllUsersResponse>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.users],
			},
		},
	).then((data) => data.users);
}

export async function getUser(userId: string) {
	"use server";

	return await authenticated<{ user: User }>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}/${userId}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.users],
			},
		},
	).then((data) => data.user);
}

export async function getCurrentUser() {
	"use server";

	return await authenticated<{ user: User }>(
		`${process.env.RV_BACKEND_URL}/${userTargetUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.currentUser],
			},
		},
	).then((data) => data.user);
}

export async function getUserDepositHistory(userId: number) {
	"use server";

	return await authenticated<{ deposits: Omit<Deposit, "user">[] }>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}/${userId}/depositHistory`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.deposits],
			},
		},
	).then((data) => data.deposits);
}

export async function getUserPurchaseHistory(userId: number) {
	"use server";

	return await authenticated<{ purchases: Omit<Purchase, "user">[] }>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}/${userId}/purchaseHistory`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.purchases],
			},
		},
	).then((data) => data.purchases);
}

export async function changeUserRole(userId: number, role: string) {
	"use server";

	return await authenticated<{ role: string }>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}/${userId}/changeRole`,
		{
			method: "POST",
		},
		{ role },
	).then((data) => data.role);
}

export async function changePassword(userId: number, password: string) {
	"use server";

	return await authenticated<{ password: string }>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}/${userId}/changePassword`,
		{
			method: "POST",
		},
		{ password },
	).then((data) => data.password);
}

export async function changePasswordForUser(userId: number, password: string) {
	"use server";

	const session = await auth();
	const userRole = session?.user?.user?.role;
	const loggedInUserId = session?.user?.user?.userId;

	const targetUrl = `${process.env.RV_BACKEND_URL}/${userTargetUrl}/changePassword`;
	const response = await authenticated<{ success: boolean }>(
		targetUrl,
		{
			method: "POST",
		},
		{ password },
	);

	if (!response.success) {
		throw new Error("Password change failed");
	}
	return true;
}
