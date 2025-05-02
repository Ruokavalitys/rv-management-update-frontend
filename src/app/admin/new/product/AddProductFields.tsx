"use client";

import Barcode from "@/components/Barcode";
import { CategoryCombobox } from "@/components/CategoryCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/use-toast";
import { generateEAN13Barcode } from "@/lib/barcodeUtils";
import { nextFieldOnEnter } from "@/lib/utils";
import { addProductAction } from "@/server/actions/products";
import { createBox } from "@/server/requests/boxRequests";
import { Category } from "@/server/requests/categoryRequests";
import { AdminProduct } from "@/server/requests/productRequests";
import { Dice5 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

function AddProductFields({ categories }: { categories: Category[] }) {
	const searchParams = useSearchParams();
	const [barcode, setBarcode] = useState(searchParams.get("barcode") ?? "");
	const [showError, setShowError] = useState<string | null>(null);
	const initialState = { success: false };
	const [state, addProduct] = useFormState<
		{
			success: boolean;
			newProduct?: AdminProduct;
			error?: { name?: string[]; general?: string };
		},
		FormData
	>(addProductAction, initialState);
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		if (state.success && state.newProduct) {
			const { newProduct: product } = state;
			const boxBarcode = searchParams.get("boxBarcode");
			const itemsPerBox = searchParams.get("itemsPerBox");
			const handleRedirect = async () => {
				try {
					if (boxBarcode) {
						if (itemsPerBox && Number(itemsPerBox) > 0) {
							await createBox({
								boxBarcode,
								itemsPerBox: Number(itemsPerBox),
								productBarcode: product.barcode.toString(),
							});
							toast({
								title: "Box Created",
								description: `Box with barcode ${boxBarcode} created successfully.`,
								duration: 3000,
							});
							router.push(
								`/admin/buy_in/product/${product.barcode}?type=box&boxBarcode=${boxBarcode}`,
							);
						} else {
							router.push(
								`/admin/new/${boxBarcode}/new-box?productBarcode=${product.barcode}`,
							);
						}
					} else if (searchParams.has("barcode")) {
						router.push(`/admin/new/${product.barcode}/box-prompt`);
					} else {
						router.push(`/admin/products/${product.barcode}`);
					}
				} catch (err: any) {
					toast({
						title: "Error",
						description: "Failed to create box.",
						variant: "destructive",
						duration: 3000,
					});
				}
			};
			toast({
				title: "Product Created",
				description: `Product ${product.name} has been created`,
				duration: 3000,
			});
			handleRedirect();
		}
	}, [state.success, state.newProduct, router, searchParams, toast]);

	useEffect(() => {
		if (state.error?.name) {
			setShowError("Please enter a valid product name (1-60 characters)");
			const timer = setTimeout(() => setShowError(null), 3000);
			return () => clearTimeout(timer);
		} else if (state.error?.general) {
			setShowError("An error occurred. Please try again.");
			const timer = setTimeout(() => setShowError(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [state.error]);

	const allowOnlyDigits = (e: React.FormEvent<HTMLInputElement>) => {
		const input = e.nativeEvent as InputEvent;
		if (input.data && /\D/.test(input.data)) {
			e.preventDefault();
		}
	};

	const generateBarcode = () => {
		const ean13Barcode = generateEAN13Barcode();
		setBarcode(ean13Barcode);
	};

	return (
		<>
			<div
				className="flex h-5/6 w-96 flex-shrink flex-col flex-wrap items-center gap-4"
				onKeyDown={nextFieldOnEnter}
			>
				<div className={`${searchParams.has("barcode") && "hidden"} w-full`}>
					<label htmlFor="barcode" className="text-sm text-stone-500">
						Barcode (1-14 digits)
					</label>
					<div className="flex items-center gap-x-2">
						<Input
							id="barcode"
							name="barcode"
							placeholder="Barcode"
							value={barcode}
							onChange={(e) => setBarcode(e.target.value)}
							data-next="name"
							autoFocus={!searchParams.has("barcode")}
							containerClassName="mb-2"
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={14}
							onBeforeInput={allowOnlyDigits}
						/>
						<Button
							type="button"
							variant="outline"
							onClick={generateBarcode}
							className="h-8 w-8 p-1 border border-stone-300 hover:bg-stone-100"
							style={{ marginTop: "-8px" }}
							title="Creates a random EAN-13 code"
						>
							<Dice5 className="h-6 w-6 text-stone-600" />
						</Button>
					</div>
				</div>
				<Barcode barcode={barcode} displayInvalid />
				<div className="w-full">
					<label htmlFor="name" className="text-sm text-stone-500">
						Name (1-60 characters)
					</label>
					<Input
						id="name"
						name="name"
						placeholder="Name"
						data-next="categoryId"
						autoFocus={searchParams.has("barcode")}
						maxLength={60}
					/>
					{showError && (
						<p className="text-sm text-red-500 mt-1">{showError}</p>
					)}
				</div>
				<div className="w-full">
					<label htmlFor="category" className="text-sm text-stone-500">
						Category
					</label>
					<CategoryCombobox
						categories={categories}
						id="categoryId"
						name="categoryId"
					/>
				</div>
			</div>
			<div className="flex w-full flex-row-reverse justify-between gap-x-4">
				<SubmitButton
					id="productSubmit"
					className="w-full"
					formAction={addProduct}
				>
					Create Product
				</SubmitButton>
				<Button asChild variant="outline" className="w-full">
					<Link
						href={
							searchParams.get("boxBarcode")
								? `/admin/new/${searchParams.get("boxBarcode")}/new-box`
								: searchParams.get("barcode")
									? "/admin/buy_in"
									: "/admin/products"
						}
					>
						Cancel
					</Link>
				</Button>
			</div>
		</>
	);
}

export default AddProductFields;
