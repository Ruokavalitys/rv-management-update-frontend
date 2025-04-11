"use client";

import Link from "next/link";

export default function ReportsHome() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-semibold">Reports</h1>
      <p>Select a report type:</p>

      <div className="flex flex-col gap-4">
        <Link
          href="/admin/reports/monthly"
          className="rounded-lg border p-4 shadow hover:bg-gray-50"
        >
          📊 Monthly Financial Report
        </Link>

        <Link
          href="/admin/reports/deposits"
          className="rounded-lg border p-4 shadow hover:bg-gray-50"
        >
          👤 User Deposit Report
        </Link>
      </div>
    </div>
  );
}
