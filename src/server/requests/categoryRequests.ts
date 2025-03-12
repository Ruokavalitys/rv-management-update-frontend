"use server";

import { authenticated } from "../wrappers";
import { Product } from "./productRequests";
import { QueryKeys } from "./queryKeys";

const targetUrl = "api/v1/categories";
const targetAdminUrl = "api/v1/admin/categories";

export type Category = {
	categoryId: number;
	description: string;
};

type categoriesRequest = {
	categories: Category[];
};

export async function getAllCategories() {
	"use server";

	const categories = await authenticated<categoriesRequest>(
		`${process.env.RV_BACKEND_URL}/${targetUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.categories],
			},
		},
	).then((data) => data.categories);

	return categories.sort((a, b) => a.categoryId - b.categoryId);
}

type updateCategoryRequest = Category;
type updateCategoryResponse = {
	category: Category;
};

export async function updateCategory(category: updateCategoryRequest) {
	"use server";

	return await authenticated<updateCategoryResponse>(
		`${process.env.RV_BACKEND_URL}/${targetAdminUrl}/${category.categoryId}`,
		{
			method: "PATCH",
			body: JSON.stringify(category),
		},
	).then((data) => data.category);
}

type deleteCategoryResponse = {
	deletedCategory: Category;
	movedProducts: Product["barcode"][];
};

export async function deleteCategory(categoryId: number) {
	"use server";

	return await authenticated<deleteCategoryResponse>(
		`${process.env.RV_BACKEND_URL}/${targetAdminUrl}/${categoryId}`,
		{
			method: "DELETE",
		},
	);
}

type createCategoryRequest = {
	description: string;
};

type createCategoryResponse = {
	category: Category;
};

export async function createCategory(category: createCategoryRequest) {
	"use server";

	return await authenticated<createCategoryResponse>(
		`${process.env.RV_BACKEND_URL}/${targetAdminUrl}`,
		{
			method: "POST",
			body: JSON.stringify(category),
		},
	).then((data) => data.category);
}