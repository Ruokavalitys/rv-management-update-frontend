"use server";

import { User } from "@/server/requests/userRequests";
import { authenticated } from "@/server/wrappers";
import { AdminProduct } from "./productRequests";
import { QueryKeys } from "./queryKeys";

const adminDepositsUrl = "api/v1/admin/depositHistory";
const adminPurchasesUrl = "api/v1/admin/purchaseHistory";
const userDepositsUrl = "api/v1/user/depositHistory";
const userPurchasesUrl = "api/v1/user/purchaseHistory";
const overViewUrl = "api/v1/admin/combinedHistory";

export type Deposit = {
	depositId: number;
	time: string;
	amount: number;
	balanceAfter: number;
	user: User;
	type: number;
};
export type getAllDepositsResponse = {
	deposits: Deposit[];
};

export async function getAllDeposits() {
	"use server";

	return await authenticated<getAllDepositsResponse>(
		`${process.env.RV_BACKEND_URL}/${adminDepositsUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.deposits],
			},
		},
	).then((data) => data.deposits);
}

export async function getCurrentUserDeposits() {
	"use server";

	return await authenticated<{ deposits: Omit<Deposit, "user">[] }>(
		`${process.env.RV_BACKEND_URL}/${userDepositsUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.deposits],
			},
		},
	).then((data) => data.deposits);
}

export type Purchase = {
	purchaseId: number;
	time: string;
	price: number;
	balanceAfter: number;
	stockAfter: number;
	product: AdminProduct;
	user: User;
	returned: boolean;
	returnedTime: string;
	returnedBalanceAfter: number;
	isReturnAction: boolean;
};
export type getAllPurchasesResponse = {
	purchases: Purchase[];
};

export async function getAllPurchases() {
	"use server";

	return await authenticated<getAllPurchasesResponse>(
		`${process.env.RV_BACKEND_URL}/${adminPurchasesUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.purchases],
			},
		},
	).then((data) => data.purchases);
}

export async function getCurrentUserPurchases() {
	"use server";

	return await authenticated<{ purchases: Omit<Purchase, "user">[] }>(
		`${process.env.RV_BACKEND_URL}/${userPurchasesUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.purchases],
			},
		},
	).then((data) => data.purchases);
}

export type getPagedDepositsResponse = {
	deposits: Deposit[];
	count: number;
};

export async function getPagedDeposits(page: number, limit: number) {
	"use server";

	const offset = (page - 1) * limit;

	return await authenticated<getPagedDepositsResponse>(
		`${process.env.RV_BACKEND_URL}/${adminDepositsUrl}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			next: {
				tags: [QueryKeys.deposits, offset.toString(), limit.toString()],
			},
		},
		{ limit, offset },
	).then((data) => {
		return data;
	});
}

export type getPagedPurchasesResponse = {
	purchases: Purchase[];
	count: number;
};

export async function getPagedPurchases(page: number, limit: number) {
	"use server";

	const offset = (page - 1) * limit;

	return await authenticated<getPagedPurchasesResponse>(
		`${process.env.RV_BACKEND_URL}/${adminPurchasesUrl}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			next: {
				tags: [QueryKeys.purchases, offset.toString(), limit.toString()],
			},
		},
		{ limit, offset },
	).then((data) => {
		return data;
	});
}

export async function getPagedCombined(page: number, limit: number) {
	"use server";

	const offset = (page - 1) * limit;

	return await authenticated<getPagedPurchasesResponse>(
		`${process.env.RV_BACKEND_URL}/${overViewUrl}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			next: {
				tags: [QueryKeys.purchases, offset.toString(), limit.toString()],
			},
		},
		{ limit, offset },
	).then((data) => {
		return data;
	});
}

export type Transaction = Partial<Deposit> | Partial<Purchase>;
