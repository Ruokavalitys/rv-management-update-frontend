type Report = {
	month: string;
	bottleReturns: number;
	purchases: number;
	productReturns: number;
	bottleReturnRefunds: number;
	bankDeposits: number;
	cashDeposits: number;
	totalUserBalance: number;
};

export function ReportRow({ report, isTotal }: { report: Report; isTotal?: boolean }) {
	return (
		<div
			className={`flex items-center justify-start border-b border-gray-300 p-4 ${isTotal ? "font-bold bg-gray-200 border-t border-gray-500" : ""}`}
		>
			<div className="w-32 pl-6">{report.month}</div>
			<div className="w-32 pl-6">{report.purchases} €</div>
			<div className="w-32 pl-6">{report.productReturns} €</div>
			<div className="w-32 pl-6">{report.bottleReturnRefunds} €</div>
			<div className="w-32 pl-6">{report.bankDeposits} €</div>
			<div className="w-32 pl-6">{report.cashDeposits} €</div>
			<div className="w-32 pl-6 font-bold">{report.totalUserBalance} €</div>
		</div>
	);
}
