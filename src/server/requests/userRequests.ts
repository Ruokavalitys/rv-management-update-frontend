"use server";

import { authenticated } from "../wrappers";
import { Deposit, Purchase } from "./historyRequests";
import { QueryKeys } from "./queryKeys";
import { UserRole } from "./types";

const targetUrl = "api/v1/admin/users";

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
    `${process.env.RV_BACKEND_URL}/${targetUrl}`,
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
    `${process.env.RV_BACKEND_URL}/${targetUrl}/${userId}`,
    {
      method: "GET",
      next: {
        tags: [QueryKeys.users],
      },
    },
  ).then((data) => data.user);
}

export async function getUserDepositHistory(userId: number) {
  "use server";

  return await authenticated<{ deposits: Omit<Deposit, "user">[] }>(
    `${process.env.RV_BACKEND_URL}/${targetUrl}/${userId}/depositHistory`,
    {
      method: "GET",
      next: {
        tags: [QueryKeys.deposits],
      },
    },
  ).then((data) => data.deposits);
}

export async function getUserPurchaseHistory(userId: number) {
  "user server";

  return await authenticated<{ purchases: Omit<Purchase, "user">[] }>(
    `${process.env.RV_BACKEND_URL}/${targetUrl}/${userId}/purchaseHistory`,
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
    `${process.env.RV_BACKEND_URL}/${targetUrl}/${userId}/changeRole`,
    {
      method: "POST",
    },
    { role }
  ).then((data) => data.role);
}