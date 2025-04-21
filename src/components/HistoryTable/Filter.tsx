"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePartialSetAtom } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { atomWithReset, useHydrateAtoms, useResetAtom } from "jotai/utils";
import { useState } from "react";

const filtersAtom = atomWithReset({});

const getTodayDate = (): string => {
	const today = new Date();
	const year = today.getFullYear();
	const month = (today.getMonth() + 1).toString().padStart(2, "0");
	const day = today.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const getDateOnly = (date: Date): Date => {
	return new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
	);
};

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
	const [error, setError] = useState<string | null>(null);

	const resetDateFilter = () => {
		setFilters({ fromDate: undefined, toDate: undefined });
		setError(null);
	};

	const handleDateChange = (field: "fromDate" | "toDate", value: string) => {
		setError(null);

		if (value === "") {
			setFilters({ [field]: undefined });
			return;
		}

		const newDate = new Date(value);
		const today = getDateOnly(new Date());

		if (getDateOnly(newDate) > today) {
			setError("Dates cannot be in the future.");
			return;
		}

		if (field === "fromDate" && filters.toDate) {
			const toDate = new Date(filters.toDate);
			if (newDate > toDate) {
				setError("Start date must be before end date.");
				return;
			}
		} else if (field === "toDate" && filters.fromDate) {
			const fromDate = new Date(filters.fromDate);
			if (newDate < fromDate) {
				setError("Start date must be before end date.");
				return;
			}
		}

		setFilters({ [field]: value });
	};

	return (
		<div className="flex w-1/4 flex-col gap-y-4">
			<label className="-mb-2 text-sm text-stone-500">Filters</label>
			<Button
				onClick={() => {
					resetFilters();
					setError(null);
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
							max={getTodayDate()}
							className="w-32 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
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
							max={getTodayDate()}
							className="w-32 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
						/>
					</div>
				</div>
				{error && (
					<span className="text-red-500 text-sm whitespace-nowrap">
						{error}
					</span>
				)}
			</div>
		</div>
	);
}
