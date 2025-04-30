"use client";

import { CategoryCombobox } from "@/components/CategoryCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/use-toast";
import { calculateMargin, calculateSellPrice } from "@/lib/marginUtils";
import { nextFieldOnEnter } from "@/lib/utils";
import { editProductAction } from "@/server/actions/products";
import { Category } from "@/server/requests/categoryRequests";
import { Product } from "@/server/requests/productRequests";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";

type ProductEditFormProps = {
	product: Product;
	defaultMargin: number;
	categories: Category[];
};

function useResettableState<T>(
	initialValue: T,
): [T, Dispatch<SetStateAction<T>>, () => void] {
	const [value, setValue] = useState(initialValue);
	const resetValue = () => setValue(initialValue);
	return [value, setValue, resetValue];
}

const toDecimalPlaces = (value: number) => (value / 100).toFixed(2);

export const ProductEditForm = ({
	product,
	defaultMargin,
	categories,
}: ProductEditFormProps) => {
	const [state, updateProduct] = useFormState(editProductAction, {
		success: false,
	});

	const [name, setName, resetName] = useResettableState(product.name);
	const [category, setCategory, resetCategory] = useResettableState(
		product.category.categoryId,
	);
	const [stock, setStock, resetStock] = useResettableState(
		product.stock.toString(),
	);
	const [buyPrice, setBuyPrice, resetBuyPrice] = useResettableState(
		toDecimalPlaces(product.buyPrice).toString(),
	);
	const [sellPrice, setSellPrice, resetSellPrice] = useResettableState(
		toDecimalPlaces(product.sellPrice).toString(),
	);
	const [activeMargin, setActiveMargin] = useState(
		calculateMargin(
			toDecimalPlaces(product.buyPrice),
			toDecimalPlaces(product.sellPrice),
			defaultMargin,
		),
	);

	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		if (state.success) {
			toast({ title: "Product updated", duration: 3000 });
			router.push(`/admin/products/${product.barcode}`);
		} else if (state.error) {
			toast({ title: "Error updating product", duration: 3000 });
		}
	}, [state]);

	const handleBuyPriceChange = (value: string) => {
		setBuyPrice(value);
		if (value === "") {
			setSellPrice("");
			setActiveMargin(defaultMargin);
		} else {
			const newSellPrice = calculateSellPrice(value, defaultMargin);
			setSellPrice(newSellPrice);
			setActiveMargin(calculateMargin(value, newSellPrice, defaultMargin));
		}
	};

	const handleSellPriceChange = (value: string) => {
		setSellPrice(value);
		setActiveMargin(calculateMargin(buyPrice, value, defaultMargin));
	};

	const handleResetPrices = () => {
		resetBuyPrice();
		resetSellPrice();
		setActiveMargin(
			calculateMargin(
				toDecimalPlaces(product.buyPrice),
				toDecimalPlaces(product.sellPrice),
				defaultMargin,
			),
		);
	};

	const isDefaultMargin = Math.abs(activeMargin - defaultMargin) < 0.001;
	const isInvalidForMargin = buyPrice === "" || sellPrice === "";

	return (
		<form
			className="mb-8 flex h-full w-full flex-col justify-between gap-y-4"
			autoComplete="off"
		>
			<div
				className="flex w-full flex-col gap-y-4"
				onKeyDown={nextFieldOnEnter}
			>
				<div className="mr-11 flex">
					<Input
						id="name"
						data-next="stock"
						name="name"
						type="text"
						containerClassName="w-[90%]"
						className="text-2xl font-semibold"
						value={name}
						onChange={({ target }) => setName(target.value)}
					/>
					<div
						onClick={resetName}
						className="ml-2 h-fit cursor-pointer rounded-md border p-3 hover:bg-stone-100"
					>
						<RotateCcw className="h-4 w-4" />
					</div>
				</div>

				<input
					type="hidden"
					name="barcode"
					id="barcode"
					value={product.barcode}
				/>

				<div className="flex gap-x-8">
					<div className="flex flex-col gap-y-2">
						<label htmlFor="stock" className="text-sm text-stone-500">
							Stock
						</label>
						<div className="inline-flex items-center">
							<Input
								id="stock"
								name="stock"
								type="number"
								value={stock}
								onChange={({ target }) => setStock(target.value)}
								placeholder="Stock"
								data-next="categoryId"
								step={1}
								containerClassName="w-[10ch]"
								className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							/>
							<div
								onClick={resetStock}
								className="ml-2 h-fit cursor-pointer rounded-md border p-3 hover:bg-stone-100"
							>
								<RotateCcw className="h-4 w-4" />
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-y-2">
						<div className="flex gap-x-4">
							<div className="flex flex-col gap-y-2">
								<label htmlFor="buyPrice" className="text-sm text-stone-500">
									Buy Price (€)
								</label>
								<Input
									id="buyPrice"
									name="buyPrice"
									type="number"
									placeholder=""
									data-next="sellPrice"
									step={0.01}
									min={0.01}
									containerClassName="w-[10ch]"
									className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									value={buyPrice}
									onChange={({ target }) => handleBuyPriceChange(target.value)}
								/>
							</div>

							<div className="flex flex-col gap-y-2">
								<label htmlFor="sellPrice" className="text-sm text-stone-500">
									Sell Price (€)
								</label>
								<Input
									id="sellPrice"
									name="sellPrice"
									type="number"
									placeholder=""
									data-next="buyInSubmit"
									step={0.01}
									min={0.01}
									value={sellPrice}
									onChange={({ target }) => handleSellPriceChange(target.value)}
									containerClassName="w-[10ch]"
									className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
							</div>

							<div className="flex flex-col gap-y-2">
								<label htmlFor="resetPrices" className="text-sm text-stone-500">
									Reset prices
								</label>
								<div
									className="flex h-fit cursor-pointer items-center justify-center rounded-md border p-3 hover:bg-stone-100"
									onClick={handleResetPrices}
								>
									<RotateCcw className="h-4 w-4" />
								</div>
							</div>
						</div>

						<div className="text-center text-sm text-stone-500">
							{isInvalidForMargin
								? "Enter prices to calculate margin"
								: isDefaultMargin
									? `Default margin applied: ${(activeMargin * 100).toFixed(2)}%`
									: `Current margin: ${(activeMargin * 100).toFixed(2)}% (Default margin: ${(defaultMargin * 100).toFixed(2)}%)`}
						</div>
					</div>
				</div>

				<div className="-mt-4 flex w-full flex-col gap-y-2">
					<label htmlFor="category" className="text-sm text-stone-500">
						Category
					</label>
					<div className="flex">
						<CategoryCombobox
							value={category}
							onValueChange={setCategory}
							categories={categories}
							id="categoryId"
							name="categoryId"
							className="h-full"
						/>
						<div
							onClick={resetCategory}
							className="ml-2 h-fit cursor-pointer rounded-md border p-3 hover:bg-stone-100"
						>
							<RotateCcw className="h-4 w-4" />
						</div>
					</div>
				</div>
			</div>
			<div className="flex w-full flex-row-reverse justify-start gap-x-4">
				<SubmitButton formAction={updateProduct}>Update Product</SubmitButton>
				<Link href={`/admin/products/${product.barcode}`}>
					<Button tabIndex={-1} variant="outline">
						Back
					</Button>
				</Link>
			</div>
		</form>
	);
};
