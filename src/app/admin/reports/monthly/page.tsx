"use client";

import { getFinancialReports } from "@/server/requests/reportService";
import { useEffect, useState } from "react";
import DownloadReportButton from "./DownloadReportButton";
import { ReportRow } from "./ReportRow";

export default function Reports() {
	const [startDate, setStartDate] = useState("2000-01-01");
	const [endDate, setEndDate] = useState("2025-12-31");
	const [reports, setReports] = useState([]);

	useEffect(() => {
		async function fetchReports() {
			const data = await getFinancialReports(startDate, endDate);
			setReports(data);
		}
		fetchReports();
	}, [startDate, endDate]);

	return (
		<div className="flex h-full w-full flex-col gap-y-4 pb-10 pt-6">
			<h1 className="text-3xl font-semibold">Reports</h1>
			<div className="flex items-center gap-4 border-b pb-4">
				<label className="font-medium">Start Date:</label>
				<input
					type="month"
					value={startDate.substring(0, 7)}
					onChange={(e) => setStartDate(`${e.target.value}-01`)}
					className="border p-2 rounded"
				/>

				<label className="font-medium">End Date:</label>
				<input
					type="month"
					value={endDate.substring(0, 7)}
					onChange={(e) => setEndDate(`${e.target.value}-31`)}
					className="border p-2 rounded"
				/>
			</div>
			<div className="h-full font-medium text-gray-700 min-h-0 w-full overflow-y-auto overscroll-none rounded-lg border shadow-lg">
				<div>
					<div className="flex items-center justify-start border-b border-gray-400 bg-gray-100 p-4 font-bold">
						<div className="w-32 pl-6">Month</div>
						<div className="w-32 pl-6">Purchases (€)</div>
						<div className="w-32 pl-6">Product Returns (€)</div>
						<div className="w-32 pl-6">Bottle/Can Returns (€)</div>
						<div className="w-32 pl-6">Bank Deposits (€)</div>
						<div className="w-32 pl-6">Cash Deposits (€)</div>
            <div className="w-32 pl-6">Legacy Deposits (€)</div>
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

