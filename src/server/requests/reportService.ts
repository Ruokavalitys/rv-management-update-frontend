export async function getFinancialReports() {
	const reports = [
		{
			month: "2024-01",
			bottleReturns: 1,
			purchases: 1,
			productReturns: 1,
			bottleReturnRefunds: 1,
			bankDeposits: 1,
			cashDeposits: 1,
			totalUserBalance: 1,
		},
		{
			month: "2024-02",
			bottleReturns: 1,
			purchases: 1,
			productReturns: 1,
			bottleReturnRefunds: 1,
			bankDeposits: 1,
			cashDeposits: 1,
			totalUserBalance: 1,
		},
		{
			month: "2024-03",
			bottleReturns: 1,
			purchases: 1,
			productReturns: 1,
			bottleReturnRefunds: 1,
			bankDeposits: 1,
			cashDeposits: 1,
			totalUserBalance: 1,
		},
		{
			month: "2024-04",
			bottleReturns: 1,
			purchases: 1,
			productReturns: 1,
			bottleReturnRefunds: 1,
			bankDeposits: 1,
			cashDeposits: 1,
			totalUserBalance: 1,
		},
	];

	const total = reports.reduce(
		(acc, report) => ({
			month: "TOTAL",
			bottleReturns: acc.bottleReturns + report.bottleReturns,
			purchases: acc.purchases + report.purchases,
			productReturns: acc.productReturns + report.productReturns,
			bottleReturnRefunds: acc.bottleReturnRefunds + report.bottleReturnRefunds,
			bankDeposits: acc.bankDeposits + report.bankDeposits,
			cashDeposits: acc.cashDeposits + report.cashDeposits,
			totalUserBalance: acc.totalUserBalance + report.totalUserBalance,
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

	return [...reports, total];
}
