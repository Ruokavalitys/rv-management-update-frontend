"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { generateEAN13Barcode } from "@/lib/barcodeUtils";
import { createBox } from "@/server/requests/boxRequests";
import { Dice5, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

type Props = {
	productBarcode: string;
	onSuccess: () => void;
	onCancel: () => void;
	initialBoxBarcode?: string;
	hideBoxBarcodeInput?: boolean;
};

export default function BoxCreationForm({
	productBarcode,
	onSuccess,
	onCancel,
	initialBoxBarcode,
	hideBoxBarcodeInput = false,
}: Props) {
	const { toast } = useToast();
	const [boxBarcode, setBoxBarcode] = useState(initialBoxBarcode || "");
	const [itemsPerBox, setItemsPerBox] = useState<string>("");

	const generateBarcode = () => {
		const ean13Barcode = generateEAN13Barcode();
		setBoxBarcode(ean13Barcode);
	};

	const initialState = { success: false, error: null as string | null };
	const [state, createBoxAction] = useFormState(
		async (_: any, formData: FormData) => {
			try {
				const box = {
					boxBarcode: formData.get("boxBarcode") as string,
					itemsPerBox: Number(formData.get("itemsPerBox")),
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
				title: "Box Created",
				description: `Successfully created box with barcode ${boxBarcode}`,
				duration: 4000,
			});
			onSuccess();
		}
	}, [state.success, boxBarcode, onSuccess, toast]);

	return (
		<form action={createBoxAction} className="flex flex-col gap-y-6 w-full">
			<input type="hidden" name="productBarcode" value={productBarcode || ""} />
			{hideBoxBarcodeInput ? (
				<input type="hidden" name="boxBarcode" value={boxBarcode} />
			) : (
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
							className="flex-1 w-full"
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
			)}
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
					onChange={(e) => setItemsPerBox(e.target.value)}
					min={1}
					required
					autoFocus={hideBoxBarcodeInput}
					className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				/>
			</div>
			{state.error && <p className="text-sm text-red-500">{state.error}</p>}
			<div className="flex w-full gap-x-4">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					className="flex-1"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="flex flex-1 items-center gap-x-2"
					disabled={state.pending}
				>
					{state.pending && <Loader className="animate-spin" />}
					Attach Box
				</Button>
			</div>
		</form>
	);
}
