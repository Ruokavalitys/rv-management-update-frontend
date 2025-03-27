"use client";

import { PurchaseRow } from "@/components/HistoryTable/PurchaseRow";
import { isDeposit, isPurchase } from "@/lib/transactions";
import { Transaction } from "@/server/requests/historyRequests";
import { useAtomValue } from "jotai";
import { atomWithReset, useHydrateAtoms } from "jotai/utils";
import { DepositRow } from "./DepositRow";

const filtersAtom = atomWithReset({});

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

	const filteredData = initialData
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
				{filteredData.map((transaction) =>
					isPurchase(transaction) ? (
						<PurchaseRow
							key={`purchase-${transaction.purchaseId}`}
							purchase={transaction}
						/>
					) : isDeposit(transaction) ? (
						<DepositRow
							key={`deposit-${transaction.depositId}`}
							deposit={transaction}
						/>
					) : null,
				)}
			</div>
		</div>
	);
}

export default HistoryTable;
