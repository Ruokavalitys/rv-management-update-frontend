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
    typeof atomWithReset<{ username: string; fullName: string }>
  >;
  initialData: Transaction[];
}) {
  useHydrateAtoms([[filtersAtom, filtersAtomFromServer]]);
  const filters = useAtomValue(filtersAtomFromServer);
  const pathname = usePathname();

  const transactions = processTransactions(initialData);
  const sortedData = sortTransactions(transactions);

  // Filter purchases based on set filters
  const filteredData = sortedData
    .filter((transaction) =>
      filters.username && filters.username.length > 0
        ? transaction.user?.username
            .toLowerCase()
            .includes(filters.username.toLowerCase())
        : true,
    )
    .filter((transaction) =>
      filters.fullName && filters.fullName.length > 0
        ? transaction.user?.fullName
            .toLowerCase()
            .includes(filters.fullName.toLowerCase())
        : true,
    );

  return (
    <div className="hidden h-full w-full overflow-y-auto rounded-lg border shadow-lg xl:flex">
      <div className="w-full">
        {
          // Show a message if no products are found
          filteredData.length === 0 && (
            <div className="flex h-64 items-center justify-center">
              <p className="text-stone-500">No items found</p>
            </div>
          )
        }
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
