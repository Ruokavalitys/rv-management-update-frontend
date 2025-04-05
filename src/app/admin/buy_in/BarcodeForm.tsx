"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box } from "@/server/requests/boxRequests";
import { Product } from "@/server/requests/productRequests";
import { useRouter } from "next/navigation";
import { useState } from "react";

type OwnProps = {
	products: Product[];
	boxes: Box[];
};

export default function BuyInBarcodeForm({ products, boxes }: OwnProps) {
	const router = useRouter();
	const [isFocused, setIsFocused] = useState(false);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const barcode = formData.get("barcode") as string;
		if (
			products.every((product) => product.barcode !== barcode) &&
			boxes.every((box) => box.boxBarcode !== barcode)
		) {
			router.push(`/admin/new/${barcode}`);
			return;
		}
		router.push(`/admin/buy_in/product/${barcode}`);
	};

	return (
		<form
			className="flex flex-col w-full max-w-3xl space-y-4"
			onSubmit={onSubmit}
			autoComplete="off"
		>
			<label
				htmlFor="barcode"
				className="text-sm font-medium text-stone-800 tracking-wide"
			>
				Enter barcode
			</label>
			<div className="relative">
				<Input
					id="barcode"
					name="barcode"
					required
					autoFocus
					className="w-full text-base"
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
				/>
			</div>
			<div className="flex justify-center">
				<Button type="submit" className="w-fit">
					Buy In
				</Button>
			</div>
		</form>
	);
}
