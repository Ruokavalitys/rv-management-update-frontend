'use client'

import { Deposit, downloadDepositReport, getDeposits } from "@/server/requests/reportDepositService"
import { useEffect, useState } from "react"

export default function DepositReport() {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [nameFilter, setNameFilter] = useState('')

  useEffect(() => {
    const fetchDeposits = async () => {
      const data = await getDeposits()
      setDeposits(data)
    }
    fetchDeposits()
  }, [])

  const filteredDeposits = deposits.filter(d =>
    d.name.toLowerCase().includes(nameFilter.toLowerCase())
  )

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Deposit Report</h2>
      <p className="mb-4">Voit hakea tässä vaiheessa nimillä Juho, Mette, Matt, Sami, Maria</p>

      <input
        type="text"
        placeholder="Enter name"
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
        className="border px-2 py-1 mb-4 mr-2 rounded"
      />

      {nameFilter && (
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
              {filteredDeposits.map((deposit, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{deposit.name}</td>
                  <td className="border px-4 py-2">{deposit.datetime}</td>
                  <td className="border px-4 py-2">{deposit.type}</td>
                  <td className="border px-4 py-2">{deposit.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => downloadDepositReport(filteredDeposits)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Download as CSV
          </button>
        </>
      )}
    </div>
  )
}
