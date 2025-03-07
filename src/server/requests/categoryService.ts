"use server";

import { Category, getAllCategories } from "./categoryRequests";
import { getAllProducts } from "./productRequests";

export type CategoryWithProductCount = Category & {
  productCount: number;
};

export async function getCategoriesWithProductCounts(): Promise<
  CategoryWithProductCount[]
> {
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAllProducts(),
  ]);

  const productCountMap: Record<number, number> = {};

  products.forEach((product) => {
    const categoryId = product.category.categoryId;
    productCountMap[categoryId] = (productCountMap[categoryId] || 0) + 1;
  });

  return categories.map((category) => ({
    ...category,
    productCount: productCountMap[category.categoryId] || 0,
  }));
}
