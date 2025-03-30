"use server";

import { authenticated } from "@/server/wrappers";

const purchaseHistoryUrl = "api/v1/admin/purchaseHistory";
const depositHistoryUrl = "api/v1/admin/depositHistory";
const usersUrl = "api/v1/admin/users";

export async function getFinancialReports(startDate: string, endDate: string) {
	// Haetaan ostot
	const purchases = await authenticated(
		`${process.env.RV_BACKEND_URL}/${purchaseHistoryUrl}`,
		{ method: "GET" }
	).then((data) => data.purchases);

	// Haetaan talletukset
	const deposits = await authenticated(
		`${process.env.RV_BACKEND_URL}/${depositHistoryUrl}`,
		{ method: "GET" }
	).then((data) => data.deposits);

	// Haetaan käyttäjien saldot
	const users = await authenticated(
		`${process.env.RV_BACKEND_URL}/${usersUrl}`,
		{ method: "GET" }
	).then((data) => data.users);

	// Filtteröidään datat aikavälin mukaan
	const filteredPurchases = purchases.filter((p) => p.time >= startDate && p.time <= endDate);
	const filteredDeposits = deposits.filter((d) => d.time >= startDate && d.time <= endDate);

	// Järjestetään ostot kuukausittain
	const monthlyReports = {};

	filteredPurchases.forEach((p) => {
		const month = p.time.substring(0, 7); // YYYY-MM
		if (!monthlyReports[month]) {
			monthlyReports[month] = {
				month,
				bottleReturns: 0,
				purchases: 0,
				productReturns: 0,
				bottleReturnRefunds: 0,
				bankDeposits: 0,
				cashDeposits: 0,
				totalUserBalance: 0,
			};
		}

		if (p.returned) {
			monthlyReports[month].productReturns += p.price;
		} else {
			monthlyReports[month].purchases += p.price;
		}
	});

	// Järjestetään talletukset kuukausittain
	filteredDeposits.forEach((d) => {
    const month = d.time.substring(0, 7); // YYYY-MM

    if (!monthlyReports[month]) {
        monthlyReports[month] = {
            month,
            bottleReturns: 0,
            purchases: 0,
            productReturns: 0,
            bottleReturnRefunds: 0,
            bankDeposits: 0,
            cashDeposits: 0,
            totalUserBalance: 0,
        };
    }

    console.log(`Deposit: ${JSON.stringify(d, null, 2)}`);

    if (d.type === 26) {
        monthlyReports[month].bankDeposits += d.amount;
        console.log(`✅ Bank deposit: ${d.amount} € added to month ${month}`);
    } else if (d.type === 17) {
        monthlyReports[month].cashDeposits += d.amount;
        console.log(`💵 Cash deposit: ${d.amount} € added to month ${month}`);
    } else {
        console.warn(`⚠️ Unknown deposit type: ${d.type}`);
    }
});


	// Käyttäjien saldojen summa
	const totalUserBalance = users.reduce((sum, user) => sum + user.moneyBalance, 0);

	// Lisätään käyttäjien saldo vuoden viimeiseen kuukauteen
	const lastMonth = Object.keys(monthlyReports).sort().pop();
	if (lastMonth) {
		monthlyReports[lastMonth].totalUserBalance = totalUserBalance;
	}

	// Lasketaan total-rivi
	const total = Object.values(monthlyReports).reduce(
		(acc, report) => ({
			month: "TOTAL",
			bottleReturns: acc.bottleReturns + report.bottleReturns,
			purchases: acc.purchases + report.purchases,
			productReturns: acc.productReturns + report.productReturns,
			bottleReturnRefunds: acc.bottleReturnRefunds + report.bottleReturnRefunds,
			bankDeposits: acc.bankDeposits + report.bankDeposits,
			cashDeposits: acc.cashDeposits + report.cashDeposits,
			totalUserBalance: report.totalUserBalance, // Lopullinen saldo vuoden lopussa
		}),
		{
			month: "TOTAL",
			bottleReturns: 0,
			purchases: 0,
			productReturns: 0,
			bottleReturnRefunds: 0,
			bankDeposits: 0,
			cashDeposits: 0,
			totalUserBalance: 0,
		}
	);

	// Palautetaan järjestettynä kuukausittain
	return [...Object.values(monthlyReports), total];
}
