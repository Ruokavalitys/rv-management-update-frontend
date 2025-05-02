"use client";

import { currencyFormatter } from "@/lib/moneyFormatter";
import { AdminProduct } from "@/server/requests/productRequests";
import { useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo } from "react";

export const productFiltersAtom = atomWithReset({
	search: "",
	onlyInStock: false,
	onlyOutOfStock: false,
	minQuantity: undefined as number | undefined,
	maxQuantity: undefined as number | undefined,
	sortByPrice: "",
	sortByQuantity: "",
	regex: "",
});

interface ProductTableProps {
	products: AdminProduct[];
	onCountChange: (count: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
	products,
	onCountChange,
}) => {
	const filters = useAtomValue(productFiltersAtom);
	const path = usePathname();

	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const matchesSearch =
				!filters.search ||
				product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
				product.barcode.includes(filters.search);

			const matchesStock =
				(!filters.onlyInStock || product.stock > 0) &&
				(!filters.onlyOutOfStock || product.stock <= 0);

			const matchesQuantity =
				(filters.minQuantity === undefined ||
					product.stock >= filters.minQuantity) &&
				(filters.maxQuantity === undefined ||
					product.stock <= filters.maxQuantity);

			let matchesRegex = true;
			if (filters.regex) {
				try {
					const regex = new RegExp(filters.regex, "i");
					const stockStr = product.stock.toString();
					const priceStr = (product.sellPrice / 100).toFixed(2);
					matchesRegex =
						regex.test(product.name) ||
						regex.test(product.barcode) ||
						regex.test(stockStr) ||
						regex.test(priceStr);
				} catch (e) {
					matchesRegex = false;
				}
			}

			return matchesSearch && matchesStock && matchesQuantity && matchesRegex;
		});
	}, [products, filters]);

	const sortedProducts = useMemo(() => {
		return [...filteredProducts].sort((a, b) => {
			if (filters.sortByPrice === "asc") return a.sellPrice - b.sellPrice;
			if (filters.sortByPrice === "desc") return b.sellPrice - a.sellPrice;
			if (filters.sortByQuantity === "asc") return a.stock - b.stock;
			if (filters.sortByQuantity === "desc") return b.stock - a.stock;
			return new Intl.Collator("fi", { sensitivity: "base" }).compare(
				a.name,
				b.name,
			);
		});
	}, [filteredProducts, filters.sortByPrice, filters.sortByQuantity]);

	useEffect(() => {
		onCountChange(sortedProducts.length);
	}, [sortedProducts.length, onCountChange]);

	const isProductPage = path.startsWith("/products/") && /\d+$/.test(path);

	return (
		<div
			className={`${
				isProductPage ? "hidden w-3/5 xl:flex" : "flex w-full"
			} h-full overflow-y-auto rounded-lg border shadow-lg`}
		>
			<div className="w-full">
				{sortedProducts.length === 0 ? (
					<div className="flex h-64 items-center justify-center">
						<p className="text-stone-500">No products found</p>
					</div>
				) : (
					sortedProducts.map((product) => (
						<Link
							tabIndex={-1}
							href={`/admin/products/${product.barcode}`}
							key={product.barcode}
						>
							<div className="flex cursor-pointer justify-between border-b border-gray-200 px-4 py-3 transition-all hover:bg-stone-100">
								<div className="flex min-h-full w-1/3 flex-col justify-between whitespace-nowrap">
									<h3 className="text-[16.74px] font-semibold">
										{product.name}
									</h3>
									<p className="text-[13.02px] text-stone-500">
										{product.barcode}
									</p>
								</div>
								<div className="flex flex-col items-end">
									<p className="text-[16.74px] text-stone-500">
										<span
											className={`font-semibold ${
												product.stock < 0 ? "text-red-500" : "text-black"
											}`}
										>
											{product.stock}
										</span>{" "}
										pcs
									</p>
									<p className="text-[16.74px] text-stone-500">
										{currencyFormatter.format(product.buyPrice / 100)} →{" "}
										<span className="font-semibold text-black">
											{currencyFormatter.format(product.sellPrice / 100)}
										</span>
									</p>
								</div>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
};

export default ProductTable;
