"use client";

import Barcode from "@/components/Barcode";
import { BoxCombobox } from "@/components/BoxCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createBox } from "@/server/requests/boxRequests";
import { Product } from "@/server/requests/productRequests";
import { Loader, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type Props = {
	boxBarcode: string;
	products: Product[];
};

export default function NewBoxForm({ boxBarcode, products }: Props) {
	const searchParams = useSearchParams();
	const initialProductBarcode = searchParams.get("productBarcode")
		? Number(searchParams.get("productBarcode"))
		: null;
	const initialItemsPerBox = searchParams.get("itemsPerBox") || "";

	const [selectedProductBarcode, setSelectedProductBarcode] = useState<
		number | null
	>(initialProductBarcode);
	const [itemsPerBox, setItemsPerBox] = useState<string>(initialItemsPerBox);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const handleProductSelect = useCallback((value: number | null) => {
		setSelectedProductBarcode(value);
		setError(null);
	}, []);

	const handleClearProduct = () => {
		handleProductSelect(null);
	};

	const handleAddNewProduct = () => {
		if (!itemsPerBox || Number(itemsPerBox) <= 0) {
			setError("Please enter a valid number of items per box.");
			return;
		}
		router.push(
			`/admin/new/product?boxBarcode=${boxBarcode}&itemsPerBox=${itemsPerBox}`,
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedProductBarcode) {
			setError("Please select a product.");
			return;
		}
		if (!itemsPerBox || Number(itemsPerBox) <= 0) {
			setError("Please enter a valid number of items per box.");
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			await createBox({
				boxBarcode,
				itemsPerBox: Number(itemsPerBox),
				productBarcode: selectedProductBarcode.toString(),
			});
			toast({
				title: "Box Created",
				description: `Box with barcode ${boxBarcode} created successfully.`,
				duration: 4000,
			});
			router.push(
				`/admin/buy_in/product/${selectedProductBarcode}?type=box&boxBarcode=${boxBarcode}`,
			);
		} catch (err: any) {
			setError(
				err.message.includes("Box barcode already in use")
					? "This barcode is already in use."
					: "Failed to create box.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const productOptions = products
		.map((product) => ({
			categoryId: Number(product.barcode),
			description: `${product.name} (${product.barcode})`,
		}))
		.sort((a, b) => a.description.localeCompare(b.description));

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-y-6 w-96">
			<div className="flex flex-col items-center gap-y-2">
				<Barcode barcode={boxBarcode} displayInvalid />
			</div>
			{products.length === 0 && !initialProductBarcode ? (
				<div className="flex flex-col gap-y-4">
					<p className="text-sm text-stone-700">
						No products available. Create a new product first.
					</p>
					<Button asChild>
						<Link
							href={`/admin/new/product?boxBarcode=${boxBarcode}&itemsPerBox=${itemsPerBox}`}
						>
							Add New Product
						</Link>
					</Button>
				</div>
			) : (
				<>
					<div>
						<label
							htmlFor="itemsPerBox"
							className="block text-sm text-stone-700 mb-1"
						>
							Items per box
						</label>
						<Input
							id="itemsPerBox"
							name="itemsPerBox"
							type="number"
							value={itemsPerBox}
							onChange={(e) => {
								setItemsPerBox(e.target.value);
								setError(null);
							}}
							min={1}
							autoFocus
							className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						/>
					</div>
					<div>
						<label
							htmlFor="product"
							className="block text-sm text-stone-500 mb-1"
						>
							Select Product
						</label>
						<div className="flex items-center gap-x-2">
							<BoxCombobox
								categories={productOptions}
								id="product"
								name="product"
								value={selectedProductBarcode ?? undefined}
								onValueChange={handleProductSelect}
							/>
							{selectedProductBarcode && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={handleClearProduct}
									className="h-8 w-8 p-0"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
					<Button type="button" variant="outline" onClick={handleAddNewProduct}>
						Product not found? Add new product.
					</Button>
					{error && <p className="text-sm text-red-500">{error}</p>}
					<div className="flex flex-row-reverse justify-between gap-x-4">
						<Button
							type="submit"
							className="flex w-full items-center gap-x-2"
							disabled={isSubmitting}
						>
							{isSubmitting && <Loader className="animate-spin h-4 w-4" />}
							Create Box
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => router.push("/admin/buy_in")}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
					</div>
				</>
			)}
		</form>
	);
}
