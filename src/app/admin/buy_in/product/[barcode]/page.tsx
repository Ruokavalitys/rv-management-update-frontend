"use server";

import { getAllBoxes } from "@/server/requests/boxRequests";
import { getMargin } from "@/server/requests/globalMarginRequests";
import { getAllProducts } from "@/server/requests/productRequests";
import BuyInFormClient from "./BuyInBoxOrProductForm";

export default async function BuyInProductPage({
	params,
	searchParams,
}: {
	params: { barcode: string };
	searchParams: { type?: string; boxBarcode?: string };
}) {
	const defaultMargin = await getMargin();
	const boxes = await getAllBoxes();
	const products = await getAllProducts();

	if (searchParams.type === "box" && searchParams.boxBarcode) {
		const foundBox = boxes.find(
			(b) => b.boxBarcode === searchParams.boxBarcode,
		);
		if (foundBox) {
			const boxData = {
				boxBarcode: foundBox.boxBarcode,
				itemsPerBox: foundBox.itemsPerBox,
				productBarcode: foundBox.product.barcode,
				productName: foundBox.product.name,
				buyPrice: foundBox.product.buyPrice,
				sellPrice: foundBox.product.sellPrice,
				productStock: foundBox.product.stock,
			};
			return (
				<BuyInFormClient
					box={boxData}
					product={null}
					defaultMargin={defaultMargin}
				/>
			);
		}
		return <div>Box barcode {searchParams.boxBarcode} not found</div>;
	}

	const foundProduct = products.find((p) => p.barcode === params.barcode);
	if (foundProduct) {
		const productData = {
			barcode: foundProduct.barcode,
			name: foundProduct.name,
			stock: foundProduct.stock,
			buyPrice: foundProduct.buyPrice,
			sellPrice: foundProduct.sellPrice,
			category: foundProduct.category,
		};
		return (
			<BuyInFormClient
				box={null}
				product={productData}
				defaultMargin={defaultMargin}
			/>
		);
	}

	const foundBox = boxes.find((b) => b.boxBarcode === params.barcode);
	if (foundBox) {
		const boxData = {
			boxBarcode: foundBox.boxBarcode,
			itemsPerBox: foundBox.itemsPerBox,
			productBarcode: foundBox.product.barcode,
			productName: foundBox.product.name,
			buyPrice: foundBox.product.buyPrice,
			sellPrice: foundBox.product.sellPrice,
			productStock: foundBox.product.stock,
		};
		return (
			<BuyInFormClient
				box={boxData}
				product={null}
				defaultMargin={defaultMargin}
			/>
		);
	}

	return <div>Barcode not found</div>;
}
