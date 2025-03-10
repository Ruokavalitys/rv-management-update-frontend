"use client";

import { PurchaseRow } from "@/components/HistoryTable/PurchaseRow";
import { Transaction } from "@/server/requests/historyRequests";
import { useAtomValue } from "jotai";
import { atomWithReset, useHydrateAtoms } from "jotai/utils";
import { DepositRow } from "./DepositRow";
import { isPurchase, isDeposit } from "@/lib/transactions";

const filtersAtom = atomWithReset({});

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

  // Filter purchases based on set filters
  const filteredData = initialData
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
        {filteredData.map((transaction) =>
          isPurchase(transaction) ? (
            <PurchaseRow key={`purchase-${transaction.purchaseId}`} purchase={transaction} />
          ) : isDeposit(transaction) ? (
            <DepositRow key={`deposit-${transaction.depositId}`} deposit={transaction} />
          ) : null,
        )}
      </div>
    </div>
  );
}

export default HistoryTable;
