"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePartialSetAtom } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import Link from "next/link";
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
			sortByQuantity: "",
		});
	};

	const toggleSortByQuantity = (sortOrder: "asc" | "desc") => {
		setFilters({
			sortByQuantity:
				filters.sortByQuantity === sortOrder ? undefined : sortOrder,
			sortByPrice: "",
		});
	};

	const handleResetFilters = () => {
		resetFilters();
	};

	const resetSortByPrice = () => setFilters({ sortByPrice: undefined });
	const resetSortByQuantity = () => setFilters({ sortByQuantity: undefined });
	const resetStockFilter = () =>
		setFilters({ onlyInStock: false, onlyOutOfStock: false });
	const resetQuantityFilter = () =>
		setFilters({ minQuantity: undefined, maxQuantity: undefined });

	const handleQuantityChange = (
		field: "minQuantity" | "maxQuantity",
		value: string,
	) => {
		if (value === "") {
			setFilters({ [field]: undefined });
			return;
		}
		const numericValue = Number(value);
		if (isNaN(numericValue)) return;
		setFilters({ [field]: numericValue });
	};

	const handleRegexChange = (value: string) => {
		setFilters({ regex: value });
	};

	return (
		<div className="flex w-1/4 flex-col gap-y-4">
			<Button asChild variant="green" className="w-full">
				<Link href="/admin/new/product">New Product</Link>
			</Button>
			<Button onClick={handleResetFilters} className="w-full" variant="outline">
				Reset all filters
			</Button>
			<label className="-mb-3 text-sm text-stone-500">Filters</label>
			<Input
				value={filters.search}
				placeholder="Search products / boxes"
				onChange={({ target }) => setFilters({ search: target.value })}
			/>
			<div className="flex flex-col gap-y-2">
				<div className="flex justify-between items-center">
					<Input
						value={filters.regex}
						placeholder="Search with Regex (e.g., ^A.*$)"
						onChange={({ target }) => handleRegexChange(target.value)}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-y-2 rounded-lg border p-4 mt-4">
				<div className="flex justify-between items-center">
					<p className="text-stone-500">Sort by price</p>
					{filters.sortByPrice && (
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

			<div className="flex flex-col gap-y-2 rounded-lg border p-4 mt-4">
				<div className="flex justify-between items-center">
					<p className="text-stone-500">Sort by quantity</p>
					{filters.sortByQuantity && (
						<Button
							variant="link"
							size="sm"
							onClick={resetSortByQuantity}
							className="text-[10px] text-gray-500 hover:text-blue-500 cursor-pointer p-0 h-auto"
						>
							Reset
						</Button>
					)}
				</div>
				<div className="flex items-center gap-x-2">
					<input
						type="radio"
						id="low_to_high_quantity"
						name="sortByQuantity"
						value="asc"
						checked={filters.sortByQuantity === "asc"}
						onChange={() => toggleSortByQuantity("asc")}
					/>
					<label
						htmlFor="low_to_high_quantity"
						className="cursor-pointer select-none text-sm"
					>
						Low to High
					</label>
				</div>
				<div className="flex items-center gap-x-2">
					<input
						type="radio"
						id="high_to_low_quantity"
						name="sortByQuantity"
						value="desc"
						checked={filters.sortByQuantity === "desc"}
						onChange={() => toggleSortByQuantity("desc")}
					/>
					<label
						htmlFor="high_to_low_quantity"
						className="cursor-pointer select-none text-sm"
					>
						High to Low
					</label>
				</div>
			</div>

			<div className="flex flex-col gap-y-2 rounded-lg border p-4 mt-4">
				<div className="flex justify-between items-center">
					<p className="text-stone-500">Filter by quantity</p>
					{(filters.minQuantity !== undefined ||
						filters.maxQuantity !== undefined) && (
						<Button
							variant="link"
							size="sm"
							onClick={resetQuantityFilter}
							className="text-[10px] text-gray-500 hover:text-blue-500 cursor-pointer p-0 h-auto"
						>
							Reset
						</Button>
					)}
				</div>
				<div className="flex gap-x-4">
					<div className="flex flex-col">
						<label
							htmlFor="minQuantity"
							className="text-xs text-stone-500 mb-1"
						>
							Min
						</label>
						<Input
							type="number"
							id="minQuantity"
							value={
								filters.minQuantity !== undefined
									? filters.minQuantity.toString()
									: ""
							}
							onChange={({ target }) =>
								handleQuantityChange("minQuantity", target.value)
							}
							className="w-24 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
						/>
					</div>
					<div className="flex flex-col">
						<label
							htmlFor="maxQuantity"
							className="text-xs text-stone-500 mb-1"
						>
							Max
						</label>
						<Input
							type="number"
							id="maxQuantity"
							value={
								filters.maxQuantity !== undefined
									? filters.maxQuantity.toString()
									: ""
							}
							onChange={({ target }) =>
								handleQuantityChange("maxQuantity", target.value)
							}
							className="w-24 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
						/>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-y-2 rounded-lg border p-4 mt-4">
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
