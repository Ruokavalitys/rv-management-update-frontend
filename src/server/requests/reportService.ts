"use server";

import { authenticated } from "@/server/wrappers";

const purchaseHistoryUrl = "api/v1/admin/purchaseHistory";
const depositHistoryUrl = "api/v1/admin/depositHistory";
const usersUrl = "api/v1/admin/users";

type User = {
  userId: number;
  moneyBalance: number;
};

const toEuros = (cents: number): number => {
  return parseFloat((cents / 100).toFixed(2));
};

export async function getFinancialReports(startDate: string, endDate: string) {
  const purchases = await authenticated(
    `${process.env.RV_BACKEND_URL}/${purchaseHistoryUrl}`,
    { method: "GET" }
  ).then((data: unknown) => (data as { purchases: unknown[] }).purchases || []);

  const deposits = await authenticated(
    `${process.env.RV_BACKEND_URL}/${depositHistoryUrl}`,
    { method: "GET" }
  ).then((data: unknown) => (data as { deposits: unknown[] }).deposits || []);

  const users = await authenticated(
    `${process.env.RV_BACKEND_URL}/${usersUrl}`,
    { method: "GET" }
  ).then((data: unknown) => (data as { users: User[] }).users || []);

  const filteredPurchases = purchases.filter(
    (p) => p.time >= startDate && p.time <= endDate
  );
  const filteredDeposits = deposits.filter(
    (d) => d.time >= startDate && d.time <= endDate
  );

  const monthlyReports: Record<string, any> = {};

  filteredPurchases.forEach((p) => {
    const month = p.time.substring(0, 7);
    const productName = p.product?.name || "";
  
    if (!monthlyReports[month]) {
      monthlyReports[month] = {
        month,
        bottleReturns: 0,
        purchases: 0,
        productReturns: 0,
        bankDeposits: 0,
        cashDeposits: 0,
        totalUserBalance: 0,
      };
    }
  
    if (
      productName.toLowerCase().includes("bottle return") ||
      productName.toLowerCase().includes("can return")
    ) {
      monthlyReports[month].bottleReturns += toEuros(p.price);
    } else if (p.returned) {
      monthlyReports[month].productReturns += -toEuros(p.price);
    } else {
      monthlyReports[month].purchases += toEuros(p.price);
    }
  });
  

  filteredDeposits.forEach((d) => {
    const month = d.time.substring(0, 7); // YYYY-MM

    if (!monthlyReports[month]) {
      monthlyReports[month] = {
        month,
        bottleReturns: 0,
        purchases: 0,
        productReturns: 0,
        bankDeposits: 0,
        cashDeposits: 0,
        totalUserBalance: 0,
      };
    }

    if (d.type === 17 || d.type === 27) {
      monthlyReports[month].bankDeposits += toEuros(d.amount);
    } else if (d.type === 26) {
      monthlyReports[month].cashDeposits += toEuros(d.amount);
    } else {
      console.warn(`⚠️ Unknown deposit type: ${d.type}`);
    }
  });

  const totalUserBalance = toEuros(
    users.reduce((sum, user) => sum + user.moneyBalance, 0)
  );

  const lastMonth = Object.keys(monthlyReports).sort().pop();
  if (lastMonth) {
    monthlyReports[lastMonth].totalUserBalance = totalUserBalance;
  }

  const sortedMonthly = Object.keys(monthlyReports)
    .sort()
    .map((month) => monthlyReports[month]);

  const total = sortedMonthly.reduce(
    (acc, report) => ({
      month: "TOTAL",
      bottleReturns: acc.bottleReturns + report.bottleReturns,
      purchases: acc.purchases + report.purchases,
      productReturns: acc.productReturns + report.productReturns,
      bankDeposits: acc.bankDeposits + report.bankDeposits,
      cashDeposits: acc.cashDeposits + report.cashDeposits,
      totalUserBalance: report.totalUserBalance,
    }),
    {
      month: "TOTAL",
      bottleReturns: 0,
      purchases: 0,
      productReturns: 0,
      bankDeposits: 0,
      cashDeposits: 0,
      totalUserBalance: 0,
    }
  );

  const roundAndFormat = (val: number) => parseFloat(val.toFixed(2));

  const formattedReports = [
    ...sortedMonthly.map((r) => ({
      ...r,
      purchases: roundAndFormat(r.purchases),
      productReturns: roundAndFormat(r.productReturns),
      bottleReturns: roundAndFormat(r.bottleReturns),
      bankDeposits: roundAndFormat(r.bankDeposits),
      cashDeposits: roundAndFormat(r.cashDeposits),
      totalUserBalance: roundAndFormat(r.totalUserBalance),
    })),
    {
      ...total,
      purchases: roundAndFormat(total.purchases),
      productReturns: roundAndFormat(total.productReturns),
      bottleReturns: roundAndFormat(total.bottleReturns),
      bankDeposits: roundAndFormat(total.bankDeposits),
      cashDeposits: roundAndFormat(total.cashDeposits),
      totalUserBalance: roundAndFormat(total.totalUserBalance),
    },
  ];

  return formattedReports;
}

