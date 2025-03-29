"use client";

import { PurchaseRow } from "@/components/HistoryTable/PurchaseRow";
import { ReturnedRow } from "@/components/HistoryTable/ReturnedRow";
import { Transaction } from "@/server/requests/historyRequests";
import { useAtomValue } from "jotai";
import { atomWithReset, useHydrateAtoms } from "jotai/utils";
import { DepositRow } from "./DepositRow";
import { isPurchase, isDeposit } from "@/lib/transactions";
import { usePathname } from 'next/navigation';
import { Purchase } from "@/server/requests/historyRequests";

const filtersAtom = atomWithReset({});

function processTransactions(transactions: (Purchase | Transaction)[]): Transaction[] {
  const processedTransactions: Transaction[] = [];

  transactions.forEach(transaction => {
    if (isPurchase(transaction)) {
      if (transaction.returned) {
        const ReturnEvent = { ...transaction, time: transaction.returnedTime, isReturnAction: true };
        processedTransactions.push(ReturnEvent);
      }
      const PurchaseEvent = { ...transaction, isReturnAction: false };
      processedTransactions.push(PurchaseEvent);
    } else if (isDeposit(transaction)) {
      processedTransactions.push(transaction);
    }
  });

  return processedTransactions;
}

function sortTransactions(transactions: Transaction[]) {
  const sortedTransactions = transactions.sort((a, b) => {
    const timeA = isPurchase(a) ? (a.isReturnAction ? a.returnedTime : a.time) : a.time;
    const timeB = isPurchase(b) ? (b.isReturnAction ? b.returnedTime : b.time) : b.time;

    if (!timeA || !timeB) {
      throw new Error("Invalid time value");
    }

    const dateA = new Date(timeA).getTime();
    const dateB = new Date(timeB).getTime();

    return dateB - dateA;
  });

  return sortedTransactions;
}

function HistoryTable({
	filtersAtom: filtersAtomFromServer,
	initialData,
}: {
	filtersAtom: ReturnType<
		typeof atomWithReset<{
			search: string;
			fromDate: string | undefined;
			toDate: string | undefined;
		}>
	>;
	initialData: Transaction[];
}) {
	useHydrateAtoms([[filtersAtom, filtersAtomFromServer]]);
	const filters = useAtomValue(filtersAtomFromServer);
  const pathname = usePathname();

  const transactions = processTransactions(initialData);
  const sortedData = sortTransactions(transactions);

	const filteredData = sortedData
		.filter((transaction) => {
			if (filters.search && filters.search.length > 0) {
				const searchLower = filters.search.toLowerCase();
				return (
					transaction.user?.username.toLowerCase().includes(searchLower) ||
					transaction.user?.fullName.toLowerCase().includes(searchLower)
				);
			}
			return true;
		})
		.filter((transaction) => {
      if (transaction.time !== undefined) {
        const transactionDate = new Date(Date.parse(transaction.time));
        if (filters.fromDate) {
          const fromDate = new Date(filters.fromDate);
          if (transactionDate < fromDate) return false;
        }
        if (filters.toDate) {
          const toDate = new Date(filters.toDate);
          toDate.setHours(23, 59, 59, 999);
          if (transactionDate > toDate) return false;
        }
        return true;
      }
      return false;
    });

	return (
		<div className="hidden h-full w-full overflow-y-auto rounded-lg border shadow-lg xl:flex xl:flex-col">
			<div className="w-full">
				<div className="flex w-full px-4 py-4 border-b border-gray-200 bg-gray-50">
					<div className="flex-1 text-left font-semibold text-gray-600 whitespace-nowrap">
						Username
					</div>
					<div className="flex-1 flex justify-center items-center text-left font-semibold text-gray-600">
						Date
					</div>
					<div className="flex-1 flex justify-center items-center text-left font-semibold text-gray-600">
						Transaction
					</div>
					<div className="flex-1 flex justify-center items-center text-left font-semibold text-gray-600">
						Product
					</div>
					<div className="flex-1 flex justify-start items-center font-semibold text-gray-600">
						<span className="ml-auto mr-10 pr-4">Amount</span>
					</div>
				</div>
				{filteredData.length === 0 && (
					<div className="flex h-64 items-center justify-center">
						<p className="text-stone-500">No items found</p>
					</div>
				)}
				{filteredData.map((transaction) => {
          if (pathname === "/admin/history") {
            return isPurchase(transaction) ? (
              transaction.returned ? (
                transaction.isReturnAction ? (
                  <ReturnedRow key={`return-${transaction.purchaseId}`} purchase={transaction} />
                ) : (
                  <PurchaseRow key={`purchase-${transaction.purchaseId}`} purchase={transaction} />
                )
              ) : (
                <PurchaseRow key={`purchase-${transaction.purchaseId}`} purchase={transaction} />
              )
            ) : isDeposit(transaction) ? (
              <DepositRow key={`deposit-${transaction.depositId}`} deposit={transaction} />
            ) : null;            
          } else if (pathname === "/admin/history/deposits") {
            return isDeposit(transaction) ? (
              <DepositRow key={`deposit-${transaction.depositId}`} deposit={transaction} />
            ) : null;
          } else if (pathname === "/admin/history/purchases") {
            return isPurchase(transaction) ? (
              !transaction.isReturnAction ? (
                <PurchaseRow key={`purchase-${transaction.purchaseId}`} purchase={transaction} />
              ) : null
            ) : null;
          } else if (pathname === "/admin/history/returns") {
            return isPurchase(transaction) && transaction.isReturnAction ? (
              <ReturnedRow key={`return-${transaction.purchaseId}`} purchase={transaction} />
            ) : null;
          }
          return null;
        })}
			</div>
		</div>
	);
}

export default HistoryTable;
