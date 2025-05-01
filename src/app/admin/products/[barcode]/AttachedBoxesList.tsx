"use client";

import Barcode from "@/components/Barcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useState } from "react";

type Box = {
	boxBarcode: string;
	itemsPerBox: number;
};

type OwnProps = {
	boxes?: Box[];
	barcode: string;
	onUpdateBox: (boxBarcode: string, newItemsPerBox: number) => void;
};

const AttachedBoxesList = ({ boxes = [], barcode, onUpdateBox }: OwnProps) => {
	const { toast } = useToast();
	const [editBox, setEditBox] = useState<{
		boxBarcode: string;
		itemsPerBox: number;
	} | null>(null);
	const [displayValue, setDisplayValue] = useState<string>("");

	const handleEdit = (box: Box) => {
		setEditBox({ boxBarcode: box.boxBarcode, itemsPerBox: box.itemsPerBox });
		setDisplayValue(box.itemsPerBox.toString());
	};

	const handleSave = (boxBarcode: string) => {
		if (!editBox) return;

		const parsedValue = displayValue === "" ? 0 : Number(displayValue);
		if (parsedValue <= 0 || displayValue === "") {
			toast({
				title: "Invalid quantity",
				description: "Quantity must be greater than 0",
				variant: "default",
				duration: 3000,
				style: { backgroundColor: "#f8fafc", color: "#333" },
			});
			return;
		}
		if (parsedValue > 9999) {
			toast({
				title: "Invalid quantity",
				description: "Quantity must not exceed 9999",
				variant: "default",
				duration: 3000,
				style: { backgroundColor: "#f8fafc", color: "#333" },
			});
			return;
		}
		onUpdateBox(boxBarcode, parsedValue);
		setEditBox(null);
		setDisplayValue("");
	};

	const handleItemsPerBoxChange = (value: string) => {
		setDisplayValue(value);

		if (value === "") return;

		const parsedValue = Number(value);
		if (!isNaN(parsedValue)) {
			if (parsedValue > 9999) {
				toast({
					title: "Invalid quantity",
					description: "Quantity must not exceed 9999",
					variant: "default",
					duration: 3000,
					style: { backgroundColor: "#f8fafc", color: "#333" },
				});
				setEditBox({
					...editBox!,
					itemsPerBox: 9999,
				});
				setDisplayValue("9999");
			} else {
				setEditBox({
					...editBox!,
					itemsPerBox: parsedValue,
				});
			}
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col">
			<Button asChild variant="outline" className="z-10 bg-white">
				<Link href={`/admin/products/${barcode}/attach-box`}>Attach Box</Link>
			</Button>
			<div className="-mt-2 h-full min-h-0 overflow-y-auto overscroll-none">
				<div className="flex flex-col gap-y-2 pb-4 pt-4">
					{boxes.length === 0 && (
						<p className="text-center text-stone-500">No boxes attached</p>
					)}
					{boxes.map((box) => (
						<div
							key={box.boxBarcode}
							className="flex items-center justify-start gap-x-1 rounded-lg border py-2 pl-4 pr-2 transition-all hover:bg-stone-100"
						>
							{editBox?.boxBarcode === box.boxBarcode ? (
								<>
									<div className="flex items-center gap-x-2 w-fit">
										<Input
											type="number"
											value={displayValue}
											onChange={(e) => handleItemsPerBoxChange(e.target.value)}
											min="1"
											max="9999"
											className="w-16"
										/>
										<span className="text-[15px] text-stone-500">pcs</span>
									</div>
									<div className="flex items-center gap-x-1 ml-auto">
										<Button
											size="sm"
											onClick={() => handleSave(box.boxBarcode)}
											disabled={
												displayValue === "" || Number(displayValue) <= 0
											}
											className="px-3 py-1 text-xs"
										>
											Save
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												setEditBox(null);
												setDisplayValue("");
											}}
											className="px-3 py-1 text-xs"
										>
											Cancel
										</Button>
									</div>
								</>
							) : (
								<>
									<div
										className="flex items-center cursor-pointer relative group w-fit"
										onDoubleClick={() => handleEdit(box)}
									>
										<p className="text-[19px] font-semibold">
											{box.itemsPerBox}{" "}
											<span className="text-[15px] text-stone-500">pcs</span>
										</p>
										<span className="absolute left-0 top-full mt-1 hidden group-hover:block bg-stone-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
											Double-click to edit
										</span>
									</div>
									<div className="flex items-center ml-auto">
										<div
											className="cursor-pointer transition-all hover:scale-105"
											onClick={() => {
												navigator.clipboard.writeText(box.boxBarcode);
												toast({
													title: "Box barcode copied to clipboard",
													duration: 3000,
												});
											}}
										>
											<Barcode
												barcode={box.boxBarcode}
												width={2}
												height={53}
												displayInvalid
												background="transparent"
											/>
										</div>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default AttachedBoxesList;
