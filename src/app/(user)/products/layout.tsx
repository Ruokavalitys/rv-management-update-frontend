// src/app/(user)/products/layout.tsx
"use client";

import {
	UserProduct,
	getAllProductsForUser,
} from "@/server/requests/productRequests";
import React, { useEffect, useState } from "react";
import ProductTable from "./ProductTable";

interface ProductsLayoutProps {
	children: React.ReactNode;
}

const ProductsLayout: React.FC<ProductsLayoutProps> = ({ children }) => {
	const [products, setProducts] = useState<UserProduct[]>([]);
	const [productCount, setProductCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchProducts = async () => {
			try {
				const fetchedProducts = await getAllProductsForUser();
				if (isMounted) {
					setProducts(fetchedProducts);
					setProductCount(fetchedProducts.length);
				}
			} catch (error) {
				console.error("Error fetching products:", error);
				if (isMounted) {
					setError("Failed to load products. Please try again later.");
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		fetchProducts();

		return () => {
			isMounted = false;
		};
	}, []);

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				Loading products...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full items-center justify-center text-red-500">
				{error}
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col py-6 gap-y-4 pb-10">
			<h1 className="text-3xl font-semibold">
				Products
				<span className="text-sm text-gray-500 font-medium ml-2">
					({productCount} items available)
				</span>
			</h1>
			<div className="flex h-full min-h-0 w-full flex-row gap-x-8">
				<div className="flex-1">
					<ProductTable products={products} onCountChange={setProductCount} />
				</div>
				<div className="w-1/4 max-w-[300px]">{children}</div>
			</div>
		</div>
	);
};

export default ProductsLayout;
