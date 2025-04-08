"use server";

import { authenticated } from "../wrappers";
import { QueryKeys } from "./queryKeys";

const adminTargetUrl = "api/v1/admin/products";
const userTargetUrl = "api/v1/products";

export type AdminProduct = {
	barcode: string;
	name: string;
	category: {
		categoryId: number;
		description: string;
	};
	sellPrice: number;
	stock: number;
	buyPrice: number;
	attachedBoxes?: { boxBarcode: string; itemsPerBox: number }[];
};

export type UserProduct = {
	barcode: string;
	name: string;
	category: {
		categoryId: number;
		description: string;
	};
	sellPrice: number;
	stock: number;
};

export type getAllProductsResponse = {
	products: AdminProduct[];
};

export async function getAllProducts() {
	return await authenticated<getAllProductsResponse>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}`,
		{ method: "GET" },
	).then((data) => data.products);
}

export type getAllProductsForUserResponse = {
	products: UserProduct[];
};

export async function getAllProductsForUser() {
	return await authenticated<getAllProductsForUserResponse>(
		`${process.env.RV_BACKEND_URL}/${userTargetUrl}`,
		{ method: "GET" },
	).then((data) => data.products);
}

export async function getProduct(barcode: string) {
	return await authenticated<{ product: AdminProduct }>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}/${barcode}`,
		{
			method: "GET",
			next: { tags: [QueryKeys.products] },
		},
	).then((data) => data.product);
}

export type addProductRequest = {
	barcode: string;
	name: string;
	categoryId: number;
	buyPrice: number;
	sellPrice: number;
	stock: number;
};

type addProductResponse = {
	product: AdminProduct;
};

export const addProduct = (product: addProductRequest) => {
	return authenticated<addProductResponse>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}`,
		{
			method: "POST",
		},
		product,
	).then((data) => data.product);
};

type updateProductRequest = {
	barcode: string;
	name?: string;
	categoryId?: number;
	buyPrice?: number;
	sellPrice?: number;
	stock?: number;
};

type updateProductResponse = {
	product: AdminProduct;
};

export const updateProduct = (product: updateProductRequest) => {
	return authenticated<updateProductResponse>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}/${product.barcode}`,
		{
			method: "PATCH",
		},
		{ ...product, barcode: undefined },
	).then((data) => data.product);
};

type addStockRequest = {
	barcode: string;
	buyPrice: number;
	sellPrice: number;
	count: number;
};

export type addStockResponse = Omit<AdminProduct, "category" | "name">;

export const addStock = (product: addStockRequest) => {
	return authenticated<addStockResponse>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}/${product.barcode}/buyIn`,
		{
			method: "POST",
		},
		{
			count: product.count,
			buyPrice: product.buyPrice,
			sellPrice: product.sellPrice,
		},
	).then((data) => data);
};

type deleteProductResponse = {
	deletedProduct: AdminProduct;
};

export const deleteProduct = (barcode: string) => {
	return authenticated<deleteProductResponse>(
		`${process.env.RV_BACKEND_URL}/${adminTargetUrl}/${barcode}`,
		{ method: "DELETE" },
	).then((data) => data.deletedProduct);
};
