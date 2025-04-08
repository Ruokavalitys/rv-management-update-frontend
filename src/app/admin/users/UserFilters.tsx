"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { usePartialSetAtom } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { userFiltersAtom } from "./UsersTable";

export default function UserFilters() {
	const setFilters = usePartialSetAtom(userFiltersAtom);
	const resetFilters = useResetAtom(userFiltersAtom);
	const filters = useAtomValue(userFiltersAtom);

	const roleOptions = ["admin", "user1", "user2", "inactive"];

	const resetBalanceFilters = () => {
		setFilters({
			balanceFilter: "none",
		});
	};

	return (
		<div className="flex w-1/4 flex-col gap-y-4">
			<label className="-mb-2 text-sm text-stone-500">Filters</label>

			<Button
				onClick={() => resetFilters()}
				className="w-full"
				variant="outline"
			>
				Reset filters
			</Button>

			<Input
				value={filters.search}
				placeholder="Search by username or full name"
				onChange={({ target }) => setFilters({ search: target.value })}
			/>

			<div className="flex flex-col gap-y-2 rounded-lg border p-4 pt-3">
				<p className="text-stone-500">Filter by role</p>
				{roleOptions.map((role) => (
					<div key={role} className="flex items-center gap-x-2">
						<Checkbox
							id={`filter_${role}`}
							checked={filters.role[role]}
							onClick={() =>
								setFilters({
									role: { ...filters.role, [role]: !filters.role[role] },
								})
							}
						/>
						<label
							htmlFor={`filter_${role}`}
							className="cursor-pointer select-none text-sm"
						>
							{role.toUpperCase()}
						</label>
					</div>
				))}
			</div>

			<div className="flex flex-col gap-y-2 rounded-lg border p-4">
				<div className="flex justify-between items-center">
					<p className="text-stone-500">Filter by balance</p>
					{(filters.balanceFilter === "positive" ||
						filters.balanceFilter === "negative") && (
						<Button
							variant="link"
							size="sm"
							onClick={resetBalanceFilters}
							className="text-[10px] text-gray-500 hover:text-blue-500 cursor-pointer p-0 h-auto"
						>
							Reset
						</Button>
					)}
				</div>

				<div className="flex items-center gap-x-2">
					<input
						type="radio"
						id="positive_balance_only"
						name="balance_filter"
						value="positive"
						checked={filters.balanceFilter === "positive"}
						onChange={() => setFilters({ balanceFilter: "positive" })}
					/>
					<label
						htmlFor="positive_balance_only"
						className="cursor-pointer select-none text-sm"
					>
						Positive balance only
					</label>
				</div>

				<div className="flex items-center gap-x-2">
					<input
						type="radio"
						id="negative_balance_only"
						name="balance_filter"
						value="negative"
						checked={filters.balanceFilter === "negative"}
						onChange={() => setFilters({ balanceFilter: "negative" })}
					/>
					<label
						htmlFor="negative_balance_only"
						className="cursor-pointer select-none text-sm"
					>
						Negative balance only
					</label>
				</div>
			</div>
		</div>
	);
}
