"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePartialSetAtom } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { atomWithReset, useHydrateAtoms, useResetAtom } from "jotai/utils";

const filtersAtom = atomWithReset({});

export default function Filter({
	filtersAtom: filtersAtomFromServer,
}: {
	filtersAtom: ReturnType<
		typeof atomWithReset<{
			search: string;
			fromDate: string | undefined;
			toDate: string | undefined;
		}>
	>;
}) {
	useHydrateAtoms([[filtersAtom, filtersAtomFromServer]]);

	const setFilters = usePartialSetAtom(filtersAtomFromServer);
	const resetFilters = useResetAtom(filtersAtomFromServer);
	const filters = useAtomValue(filtersAtomFromServer);

	const resetDateFilter = () =>
		setFilters({ fromDate: undefined, toDate: undefined });

	const handleDateChange = (field: "fromDate" | "toDate", value: string) => {
		if (value === "") {
			setFilters({ [field]: undefined });
			return;
		}
		setFilters({ [field]: value });
	};

	return (
		<div className="flex w-1/4 flex-col gap-y-4">
			<label className="-mb-2 text-sm text-stone-500">Filters</label>
			<Button
				onClick={() => {
					resetFilters();
				}}
				className="w-full"
				variant={"outline"}
			>
				Reset filters
			</Button>
			<Input
				value={filters.search}
				placeholder="Search by username or full name"
				onChange={({ target }) => setFilters({ search: target.value })}
			/>
			<div className="flex flex-col gap-y-2 rounded-lg border p-4">
				<div className="flex justify-between items-center">
					<p className="text-stone-500">Filter by date</p>
					{(filters.fromDate || filters.toDate) && (
						<Button
							variant="link"
							size="sm"
							onClick={resetDateFilter}
							className="text-[10px] text-gray-500 hover:text-blue-500 cursor-pointer p-0 h-auto"
						>
							Reset
						</Button>
					)}
				</div>
				<div className="flex gap-x-4">
					<div className="flex flex-col">
						<label htmlFor="fromDate" className="text-xs text-stone-500 mb-1">
							From
						</label>
						<Input
							type="date"
							id="fromDate"
							value={filters.fromDate || ""}
							onChange={({ target }) =>
								handleDateChange("fromDate", target.value)
							}
							className="w-36 h-10 text-center focus:outline-dashed focus:outline-2 focus:outline-gray-400"
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="toDate" className="text-xs text-stone-500 mb-1">
							To
						</label>
						<Input
							type="date"
							id="toDate"
							value={filters.toDate || ""}
							onChange={({ target }) =>
								handleDateChange("toDate", target.value)
							}
							className="w-36 h-10 text-center focus:outline-dashed focus:outline-2 focus:outline-gray-400"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
