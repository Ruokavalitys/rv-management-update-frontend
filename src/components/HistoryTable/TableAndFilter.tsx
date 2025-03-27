"use client";

import { Transaction } from "@/server/requests/historyRequests";
import { atomWithReset } from "jotai/utils";
import Filter from "./Filter";
import HistoryTable from "./HistoryTable";

export const TableAndFilter = ({
	initialData,
}: {
	initialData: Transaction[];
}) => {
	const purchaseFiltersAtom = atomWithReset({
		search: "",
		fromDate: undefined as string | undefined,
		toDate: undefined as string | undefined,
	});

	return (
		<div className="flex h-full min-h-0 w-full flex-row justify-between gap-x-8">
			<div className="w-full">
				<HistoryTable
					filtersAtom={purchaseFiltersAtom}
					initialData={initialData}
				/>
			</div>
			<Filter filtersAtom={purchaseFiltersAtom} />
		</div>
	);
};
