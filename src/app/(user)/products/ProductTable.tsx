"use client";

import { currencyFormatter } from "@/lib/moneyFormatter";
import { UserProduct } from "@/server/requests/productRequests";
import { useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import React, { useEffect, useMemo } from "react";

export const productFiltersAtom = atomWithReset({
	search: "",
	onlyInStock: false,
	onlyOutOfStock: false,
	sortByPrice: "",
});

interface ProductTableProps {
	products: UserProduct[];
	onCountChange: (count: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
	products,
	onCountChange,
}) => {
	const filters = useAtomValue(productFiltersAtom);

	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const matchesSearch =
				!filters.search ||
				product.name.toLowerCase().includes(filters.search.toLowerCase());

			const matchesStock =
				(!filters.onlyInStock || product.stock > 0) &&
				(!filters.onlyOutOfStock || product.stock <= 0);

			return matchesSearch && matchesStock;
		});
	}, [products, filters]);

	const sortedProducts = useMemo(() => {
		return [...filteredProducts].sort((a, b) => {
			if (filters.sortByPrice === "asc") return a.sellPrice - b.sellPrice;
			if (filters.sortByPrice === "desc") return b.sellPrice - a.sellPrice;
			return new Intl.Collator("fi", { sensitivity: "base" }).compare(
				a.name,
				b.name,
			);
		});
	}, [filteredProducts, filters.sortByPrice]);

	useEffect(() => {
		onCountChange(sortedProducts.length);
	}, [sortedProducts.length, onCountChange]);

	const getStockText = (stock: number) => {
		if (stock > 5) return "In stock";
		if (stock === 1) return "LowStockException: 1 remaining";
		if (stock >= 1) return `LowStockException: ${stock} remaining`;
		return "Out of stock";
	};

	const getStockStyle = (stock: number) => {
		if (stock <= 0) return "text-red-600 font-semibold text-[17px]";
		if (stock <= 5) return "text-red-700 font-medium";
		return "text-gray-700";
	};

	return (
		<div className="flex w-full h-full overflow-y-auto rounded-lg border border-gray-300 shadow-lg">
			<div className="w-full">
				{sortedProducts.length === 0 ? (
					<div className="flex h-64 items-center justify-center">
						<p className="text-stone-500">No products found</p>
					</div>
				) : (
					sortedProducts.map((product) => (
						<div
							key={product.barcode}
							className="flex justify-between border-b border-gray-200 px-4 py-3 transition-all hover:bg-stone-100"
						>
							<div className="flex min-h-full w-1/3 flex-col justify-between whitespace-nowrap">
								<h3 className="text-[16.74px] font-semibold">{product.name}</h3>
							</div>
							<div className="flex flex-col items-end">
								<p className="text-[16.74px] text-stone-500">
									<span className={getStockStyle(product.stock)}>
										{getStockText(product.stock)}
									</span>
								</p>
								<p className="text-[16.74px] text-stone-500">
									<span className="font-semibold text-black">
										{currencyFormatter.format(product.sellPrice / 100)}
									</span>
								</p>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default ProductTable;
