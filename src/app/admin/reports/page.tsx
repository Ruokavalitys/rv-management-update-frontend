"use server";

import { getFinancialReports } from "@/server/requests/reportService";
import DownloadReportButton from "./DownloadReportButton";
import { ReportRow } from "./ReportRow";

export default async function Reports() {
	const reports = await getFinancialReports();

	return (
		<div className="flex h-full w-full flex-col gap-y-4 pb-10 pt-6">
			<h1 className="text-3xl font-semibold">Reports</h1>
			<div className="h-full font-medium text-gray-700 min-h-0 w-full overflow-y-auto overscroll-none rounded-lg border shadow-lg">
				<div>
					<div className="flex items-center justify-start border-b border-gray-400 bg-gray-100 p-4 font-bold">
						<div className="w-32 pl-6">Month</div>
						<div className="w-32 pl-6">Bottle Returns (€)</div>
						<div className="w-32 pl-6">Purchases (€)</div>
						<div className="w-32 pl-6">Product Returns (€)</div>
						<div className="w-32 pl-6">Bottle Return Refunds (€)</div>
						<div className="w-32 pl-6">Bank Deposits (€)</div>
						<div className="w-32 pl-6">Cash Deposits (€)</div>
						<div className="w-32 pl-6 font-bold">Total User Balance (€)</div>
					</div>

					{reports.map((report) => (
						<ReportRow key={report.month} report={report} isTotal={report.month === "TOTAL"} />
					))}
				</div>

				<div className="p-4">
					<DownloadReportButton reports={reports} />
				</div>
			</div>
		</div>
	);
}
