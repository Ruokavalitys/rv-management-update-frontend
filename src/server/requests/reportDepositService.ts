"use server";

import { authenticated } from "@/server/wrappers";

const depositHistoryUrl = "api/v1/admin/depositHistory";

export type Deposit = {
  name: string;
  datetime: string;
  amount: number;
  type: "cash" | "bank" | "legacy" | "unknown";
};

const toEuros = (cents: number): number => {
  return parseFloat((cents / 100).toFixed(2));
};

export async function getAllDeposits(startDate: string, endDate: string, nameFilter?: string): Promise<Deposit[]> {
  const data = await authenticated(`${process.env.RV_BACKEND_URL}/${depositHistoryUrl}`, {
    method: "GET",
  }).then((res) => (res as { deposits: any[] }).deposits || []);

  console.log("📦 Raw deposit data:", data.slice(0, 5));

  return data
    .filter((d) => {
      const date = d.time.split("T")[0];
      const name = d.user.fullName || d.user.username;
      const matchesDate = date >= startDate && date <= endDate;
      const matchesName = nameFilter ? name.toLowerCase().includes(nameFilter.toLowerCase()) : true;
      return matchesDate && matchesName;
    })
    .map((d) => {
      let type: Deposit["type"] = "unknown";
      if (d.type === 26) type = "cash";
      else if (d.type === 27) type = "bank";
      else if (d.type === 17) type = "legacy";

      return {
        name: d.user.fullName || d.user.username,
        datetime: d.time.replace("T", " ").substring(0, 16),
        amount: toEuros(d.amount),
        type,
      };
    });
}
