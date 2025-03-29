"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePartialSetAtom } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { productFiltersAtom } from "./ProductTable";

export default function ProductFilters() {
	const setFilters = usePartialSetAtom(productFiltersAtom);
	const resetFilters = useResetAtom(productFiltersAtom);
	const filters = useAtomValue(productFiltersAtom);

	const toggleStockFilters = (
		filterKey: "onlyInStock" | "onlyOutOfStock",
		value: boolean,
	) => {
		if (filterKey === "onlyInStock") {
			setFilters({ onlyInStock: value, onlyOutOfStock: false });
		} else {
			setFilters({ onlyOutOfStock: value, onlyInStock: false });
		}
	};

	const toggleSortByPrice = (sortOrder: "asc" | "desc") => {
		setFilters({
			sortByPrice: filters.sortByPrice === sortOrder ? undefined : sortOrder,
		});
	};

	const handleResetFilters = () => {
		resetFilters();
	};

	const resetSortByPrice = () => setFilters({ sortByPrice: undefined });
	const resetStockFilter = () =>
		setFilters({ onlyInStock: false, onlyOutOfStock: false });

	return (
		<div className="flex w-full flex-col gap-y-4">
			<Button
				onClick={handleResetFilters}
				className="w-full max-w-md"
				variant="outline"
			>
				Reset all filters
			</Button>
			<label className="-mb-3 text-sm text-stone-500">Filters</label>
			<Input
				value={filters.search}
				placeholder="Search products"
				onChange={({ target }) => setFilters({ search: target.value })}
				className="max-w-md"
			/>
			<div className="flex flex-col gap-y-2 rounded-lg border border-gray-300 p-4 mt-4 max-w-md">
				<div className="flex justify-between items-center">
					<p className="text-stone-500">Sort by price</p>
					{(filters.sortByPrice === "asc" ||
						filters.sortByPrice === "desc") && (
						<Button
							variant="link"
							size="sm"
							onClick={resetSortByPrice}
							className="text-[10px] text-gray-500 hover:text-blue-500 cursor-pointer p-0 h-auto"
						>
							Reset
						</Button>
					)}
				</div>
				<div className="flex items-center gap-x-2">
					<input
						type="radio"
						id="low_to_high"
						name="sortByPrice"
						value="asc"
						checked={filters.sortByPrice === "asc"}
						onChange={() => toggleSortByPrice("asc")}
					/>
					<label
						htmlFor="low_to_high"
						className="cursor-pointer select-none text-sm"
					>
						Low to High
					</label>
				</div>
				<div className="flex items-center gap-x-2">
					<input
						type="radio"
						id="high_to_low"
						name="sortByPrice"
						value="desc"
						checked={filters.sortByPrice === "desc"}
						onChange={() => toggleSortByPrice("desc")}
					/>
					<label
						htmlFor="high_to_low"
						className="cursor-pointer select-none text-sm"
					>
						High to Low
					</label>
				</div>
			</div>
			<div className="flex flex-col gap-y-2 rounded-lg border border-gray-300 p-4 mt-4 max-w-md">
				<div className="flex justify-between items-center">
					<p className="text-stone-500">Show products by stock</p>
					{(filters.onlyInStock || filters.onlyOutOfStock) && (
						<Button
							variant="link"
							size="sm"
							onClick={resetStockFilter}
							className="text-[10px] text-gray-500 hover:text-blue-500 cursor-pointer p-0 h-auto"
						>
							Reset
						</Button>
					)}
				</div>
				<div className="flex items-center gap-x-2">
					<input
						type="radio"
						id="in_stock_only"
						name="stockFilter"
						value="onlyInStock"
						checked={filters.onlyInStock}
						onChange={() => toggleStockFilters("onlyInStock", true)}
					/>
					<label
						htmlFor="in_stock_only"
						className="cursor-pointer select-none text-sm"
					>
						Show in stock only
					</label>
				</div>
				<div className="flex items-center gap-x-2">
					<input
						type="radio"
						id="out_of_stock_only"
						name="stockFilter"
						value="onlyOutOfStock"
						checked={filters.onlyOutOfStock}
						onChange={() => toggleStockFilters("onlyOutOfStock", true)}
					/>
					<label
						htmlFor="out_of_stock_only"
						className="cursor-pointer select-none text-sm"
					>
						Show out of stock only
					</label>
				</div>
			</div>
		</div>
	);
}
