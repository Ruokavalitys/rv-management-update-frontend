// page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { generateEAN13Barcode } from "@/lib/barcodeUtils";
import { createBox } from "@/server/requests/boxRequests";
import { Dice5, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

export default function AttachBoxPage({
	params,
}: { params: { barcode: string } }) {
	const productBarcode = params.barcode;
	const router = useRouter();
	const { toast } = useToast();

	const [boxBarcode, setBoxBarcode] = useState("");
	const [itemsPerBox, setItemsPerBox] = useState<string>("");

	const generateBarcode = () => {
		const ean13Barcode = generateEAN13Barcode();
		setBoxBarcode(ean13Barcode);
	};

	const handleItemsPerBoxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "" || (Number(value) >= 1 && Number(value) <= 9999)) {
			setItemsPerBox(value);
		}
	};

	const initialState = { success: false, error: null as string | null };
	const [state, createBoxAction] = useFormState(
		async (_: any, formData: FormData) => {
			try {
				const itemsPerBoxValue = Number(formData.get("itemsPerBox"));
				if (itemsPerBoxValue > 9999) {
					return {
						success: false,
						error: "Items per box cannot exceed 9999.",
					};
				}
				const box = {
					boxBarcode: formData.get("boxBarcode") as string,
					itemsPerBox: itemsPerBoxValue,
					productBarcode: formData.get("productBarcode") as string,
				};
				await createBox(box);
				return { success: true, error: null };
			} catch (error: any) {
				if (error.message.includes("Box barcode already in use")) {
					return {
						success: false,
						error: "This barcode is already in use. Please generate a new one.",
					};
				}
				return {
					success: false,
					error: error.message || "Failed to create box",
				};
			}
		},
		initialState,
	);

	useEffect(() => {
		if (state.success) {
			toast({
				title: "Box attached",
				description: `Successfully attached box with barcode ${boxBarcode}`,
				duration: 3000,
			});
			router.push(`/admin/products/${productBarcode}`);
			router.refresh();
		}
	}, [state.success, boxBarcode, productBarcode, router, toast]);

	return (
		<div className="flex h-full w-full items-center justify-center">
			<div className="flex w-96 flex-col items-start gap-y-4">
				<h1 className="text-3xl font-semibold">Attach Box</h1>
				<div className="flex w-96 flex-col items-center rounded-lg border border-stone-300 bg-white p-8 shadow-lg">
					<form
						action={createBoxAction}
						className="flex flex-col gap-y-4 w-full"
						autoComplete="off"
					>
						<input
							type="hidden"
							name="productBarcode"
							value={productBarcode || ""}
						/>
						<div>
							<label
								htmlFor="boxBarcode"
								className="block text-sm text-stone-700 mb-1"
							>
								Box Barcode (1-14 digits)
							</label>
							<div className="flex items-center gap-x-2">
								<Input
									id="boxBarcode"
									name="boxBarcode"
									value={boxBarcode}
									onChange={(e) => setBoxBarcode(e.target.value)}
									required
									autoFocus
									minLength={1}
									maxLength={14}
									pattern="\d*"
									title="Box barcode must be 1 to 14 digits long and contain only numbers."
									className="w-full max-w-full"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={generateBarcode}
									className="h-8 w-8 p-1 border border-stone-300 hover:bg-stone-100"
								>
									<Dice5 className="h-4 w-4 text-stone-600" />
								</Button>
							</div>
						</div>
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
								onChange={handleItemsPerBoxChange}
								min={1}
								max={9999}
								required
								className="w-full max-w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								title="Items per box must be between 1 and 9999."
							/>
						</div>
						{state.error && (
							<p className="text-sm text-red-500">{state.error}</p>
						)}
						<div className="mt-3 flex flex-row-reverse justify-between gap-x-4">
							<Button
								type="submit"
								className="flex w-full items-center gap-x-2"
								disabled={state.pending}
							>
								{state.pending && <Loader className="animate-spin" />}
								Attach Box
							</Button>
							<Button asChild variant="outline" className="w-full">
								<Link href={`/admin/products/${productBarcode}`}>Cancel</Link>
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
