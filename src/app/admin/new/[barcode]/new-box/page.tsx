"use server";

import { getAllProducts } from "@/server/requests/productRequests";
import { Suspense } from "react";
import NewBoxForm from "./NewBoxForm";

export default async function NewBoxPage({
	params,
}: {
	params: { barcode: string };
}) {
	const products = await getAllProducts();

	return (
		<div className="flex max-h-screen flex-col items-start gap-y-4 pb-8 pt-4">
			<h1 className="text-3xl font-semibold">New Box</h1>
			<div className="flex flex-col items-center overflow-y-auto rounded-lg border border-stone-300 bg-white p-8 shadow-lg">
				<Suspense fallback={<div>Loading...</div>}>
					<NewBoxForm boxBarcode={params.barcode} products={products} />
				</Suspense>
			</div>
		</div>
	);
}
