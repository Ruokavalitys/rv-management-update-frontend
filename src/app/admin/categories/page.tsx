"use server";

import { getCategoriesWithProductCounts } from "@/server/requests/categoryService";
import { CategoryRow } from "./CategoryRow";
import { CreateCategoryRow } from "./CreateCategoryRow";

export default async function Categories() {
	const categories = await getCategoriesWithProductCounts();

	return (
		<div className="flex h-full w-full flex-col gap-y-4 pb-10 pt-6">
			<h1 className="text-3xl font-semibold">Categories</h1>
			<div className="h-full font-medium text-gray-700 min-h-0 w-full overflow-y-auto overscroll-none rounded-lg border shadow-lg">
				<div>
					<div className="flex items-center justify-start border-b border-gray-400 bg-gray-100 p-4 font-bold">
						<div className="w-24 pl-6">ID</div>
						<div className="w-24 pl-2">Products</div>
						<div className="flex-grow pl-24">Category name</div>
					</div>
					{categories.map((category) => (
						<CategoryRow
							key={category.categoryId}
							category={category}
							productCount={category.productCount}
						/>
					))}
				</div>
				<CreateCategoryRow />
			</div>
		</div>
	);
}