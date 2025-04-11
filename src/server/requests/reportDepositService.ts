export type Deposit = {
  name: string
  datetime: string
  amount: number
  type: 'cash' | 'bank'
}

export async function getDeposits(): Promise<Deposit[]> {
  return [
    { name: 'Juho', datetime: '2025-04-01 09:00', amount: 40, type: 'bank' },
    { name: 'Juho', datetime: '2025-04-05 14:20', amount: 25, type: 'cash' },
    { name: 'Mette', datetime: '2025-04-02 11:30', amount: 35, type: 'cash' },
    { name: 'Mette', datetime: '2025-04-07 16:10', amount: 45, type: 'bank' },
    { name: 'Matt', datetime: '2025-04-03 08:45', amount: 60, type: 'bank' },
    { name: 'Matt', datetime: '2025-04-06 13:15', amount: 20, type: 'cash' },
    { name: 'Sami', datetime: '2025-04-04 10:00', amount: 55, type: 'bank' },
    { name: 'Sami', datetime: '2025-04-08 15:50', amount: 30, type: 'cash' },
    { name: 'Maria', datetime: '2025-04-01 12:00', amount: 50, type: 'bank' },
    { name: 'Maria', datetime: '2025-04-09 17:25', amount: 40, type: 'cash' },
  ]
}

export function downloadDepositReport(deposits: Deposit[]) {
  const header = ['Name', 'Date & Time', 'Amount', 'Type']
  const rows = deposits.map(d => [d.name, d.datetime, d.amount.toFixed(2), d.type])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [header, ...rows].map(row => row.join(',')).join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'deposit_report.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
