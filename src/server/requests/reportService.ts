"use server";

import { authenticated } from "@/server/wrappers";

const purchaseHistoryUrl = "api/v1/admin/purchaseHistory";
const depositHistoryUrl = "api/v1/admin/depositHistory";

const toEuros = (cents: number): number => {
  return parseFloat((cents / 100).toFixed(2));
};

const getCurrentMonthEndDate = (): string => {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return endOfMonth.toISOString().split("T")[0];
};

const getFirstTransactionDate = (purchases: any[], deposits: any[]): string => {
  const allTimes = [...purchases.map(p => p.time), ...deposits.map(d => d.time)];
  return allTimes.length ? allTimes.sort()[0].split("T")[0] : "1970-01-01";
};

export async function getFinancialReports(startDate?: string, endDate: string = getCurrentMonthEndDate()) {
  const purchases = await authenticated(
    `${process.env.RV_BACKEND_URL}/${purchaseHistoryUrl}`,
    { method: "GET" }
  ).then((data: unknown) => (data as { purchases: any[] }).purchases || []);

  const deposits = await authenticated(
    `${process.env.RV_BACKEND_URL}/${depositHistoryUrl}`,
    { method: "GET" }
  ).then((data: unknown) => (data as { deposits: any[] }).deposits || []);

  if (!startDate) {
    startDate = getFirstTransactionDate(purchases, deposits);
  }

  const filteredPurchases = purchases.filter(
    (p) => p.time >= startDate && p.time <= endDate
  );
  const filteredDeposits = deposits.filter(
    (d) => d.time >= startDate && d.time <= endDate
  );

  const monthlyReports: Record<string, any> = {};

  const getMonth = (time: string) => time.substring(0, 7);

  const ensureMonth = (month: string) => {
    if (!monthlyReports[month]) {
      monthlyReports[month] = {
        month,
        bottleReturns: 0,
        purchases: 0,
        productReturns: 0,
        bankDeposits: 0,
        cashDeposits: 0,
        legacyDeposits: 0,
        totalUserBalance: 0,
      };
    }
    return monthlyReports[month];
  };

  filteredPurchases.forEach((p) => {
    const month = getMonth(p.time);
    const report = ensureMonth(month);
    const productName = p.product?.name?.toLowerCase() || "";

    if (productName.includes("bottle return") || productName.includes("can return")) {
      report.bottleReturns += toEuros(p.price);
    } else if (p.returned) {
      report.productReturns += -toEuros(p.price);
    } else {
      report.purchases += toEuros(p.price);
    }
  });

  filteredDeposits.forEach((d) => {
    const month = getMonth(d.time);
    const report = ensureMonth(month);

    if (d.type === 17) {
      report.legacyDeposits += toEuros(d.amount);
    } else if (d.type === 27) {
      report.bankDeposits += toEuros(d.amount);
    } else if (d.type === 26) {
      report.cashDeposits += toEuros(d.amount);
    } else {
      console.warn(`⚠️ Unknown deposit type: ${d.type}`);
    }
  });

  const allTransactions: { time: string; userId: number; amount: number }[] = [];

  deposits.forEach((d) => {
    allTransactions.push({
      time: d.time,
      userId: d.user.userId,
      amount: d.amount,
    });
  });

  purchases.forEach((p) => {
    allTransactions.push({
      time: p.time,
      userId: p.user.userId,
      amount: p.returned ? p.price : -p.price,
    });
  });

  allTransactions.sort((a, b) => a.time.localeCompare(b.time));

  const userBalances: Record<number, number> = {};
  const monthUserBalances: Record<string, number> = {};

  allTransactions.forEach((tx) => {
    const month = getMonth(tx.time);
    userBalances[tx.userId] = (userBalances[tx.userId] || 0) + tx.amount;
    monthUserBalances[month] = Object.values(userBalances).reduce((sum, b) => sum + b, 0);
  });

  Object.entries(monthlyReports).forEach(([month, report]) => {
    const bal = monthUserBalances[month];
    report.totalUserBalance = bal !== undefined ? toEuros(bal) : 0;
  });

  const sortedMonthly = Object.keys(monthlyReports)
    .sort()
    .map((month) => monthlyReports[month]);

  const total = sortedMonthly.reduce(
    (acc, r) => ({
      month: "TOTAL",
      bottleReturns: acc.bottleReturns + r.bottleReturns,
      purchases: acc.purchases + r.purchases,
      productReturns: acc.productReturns + r.productReturns,
      bankDeposits: acc.bankDeposits + r.bankDeposits,
      cashDeposits: acc.cashDeposits + r.cashDeposits,
      legacyDeposits: acc.legacyDeposits + r.legacyDeposits,
      totalUserBalance: r.totalUserBalance,
    }),
    {
      month: "TOTAL",
      bottleReturns: 0,
      purchases: 0,
      productReturns: 0,
      bankDeposits: 0,
      cashDeposits: 0,
      legacyDeposits: 0,
      totalUserBalance: 0,
    }
  );

  const round = (val: number) => parseFloat(val.toFixed(2));

  const formattedReports = [
    ...sortedMonthly.map((r) => ({
      ...r,
      purchases: round(r.purchases),
      productReturns: round(r.productReturns),
      bottleReturns: round(r.bottleReturns),
      bankDeposits: round(r.bankDeposits),
      cashDeposits: round(r.cashDeposits),
      legacyDeposits: round(r.legacyDeposits),
      totalUserBalance: round(r.totalUserBalance),
    })),
    {
      ...total,
      purchases: round(total.purchases),
      productReturns: round(total.productReturns),
      bottleReturns: round(total.bottleReturns),
      bankDeposits: round(total.bankDeposits),
      cashDeposits: round(total.cashDeposits),
      legacyDeposits: round(total.legacyDeposits),
      totalUserBalance: round(total.totalUserBalance),
    },
  ];

  return formattedReports;
}
