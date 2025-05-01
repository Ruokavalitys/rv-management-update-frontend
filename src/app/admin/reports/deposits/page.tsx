'use client'

import { Deposit, getAllDeposits } from "@/server/requests/reportDepositService";
import { useEffect, useState } from "react";
import DownloadDepositButton from "./DownloadDepositButton";

export default function DepositReport() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [nameFilter, setNameFilter] = useState('');

  useEffect(() => {
    const fetchDeposits = async () => {
      const data = await getAllDeposits(startDate, endDate, nameFilter);
      setDeposits(data);
    };
    fetchDeposits();
  }, [startDate, endDate, nameFilter]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Deposit Report</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Filter by name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={() => {
            setStartDate('2000-01-01');
            setEndDate('2025-12-31');
            setNameFilter('');
          }}
          className="border px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
        >
          Clear filters
        </button>
      </div>

      {deposits.length > 0 && (
        <>
          <table className="w-full border-collapse border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Date & Time</th>
                <th className="border px-4 py-2 text-left">Type</th>
                <th className="border px-4 py-2 text-left">Amount (€)</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{deposit.name}</td>
                  <td className="border px-4 py-2">{deposit.datetime}</td>
                  <td className="border px-4 py-2">{deposit.type}</td>
                  <td className="border px-4 py-2">{deposit.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <DownloadDepositButton deposits={deposits} />
        </>
      )}
    </div>
  );
}