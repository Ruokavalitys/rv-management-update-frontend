"use client";

import Barcode from "@/components/Barcode";
import Label from "@/components/WithLabel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { currencyFormatter } from "@/lib/moneyFormatter";
import { Box, getAllBoxes, updateBox } from "@/server/requests/boxRequests";
import { AdminProduct } from "@/server/requests/productRequests";
import Link from "next/link";
import { useEffect, useState } from "react";
import AttachedBoxesList from "./AttachedBoxesList";

type OwnProps = {
	product: AdminProduct;
	initialBoxes?: Box[];
};

export const ProductView = ({ product, initialBoxes = [] }: OwnProps) => {
	const { toast } = useToast();
	const [boxes, setBoxes] = useState<Box[]>(initialBoxes || []);

	useEffect(() => {
		const fetchBoxes = async () => {
			try {
				const allBoxes = await getAllBoxes();
				const productBoxes =
					allBoxes?.filter((box) => box.product?.barcode === product.barcode) ||
					[];
				productBoxes.sort((a, b) => a.itemsPerBox - b.itemsPerBox);
				setBoxes(productBoxes);
			} catch (error) {
				toast({
					title: "Error",
					description: "Failed to fetch boxes",
					variant: "default",
					duration: 3000,
				});
				setBoxes([]);
			}
		};
		fetchBoxes();
	}, [product.barcode, toast]);

	const handleUpdateBox = async (
		boxBarcode: string,
		newItemsPerBox: number,
	) => {
		try {
			await updateBox({
				boxBarcode,
				itemsPerBox: newItemsPerBox,
			});
			const allBoxes = await getAllBoxes();
			const productBoxes =
				allBoxes?.filter((box) => box.product?.barcode === product.barcode) ||
				[];
			productBoxes.sort((a, b) => a.itemsPerBox - b.itemsPerBox);
			setBoxes(productBoxes);
			toast({
				title: "Box updated",
				description: `Quantity for box ${boxBarcode} updated to ${newItemsPerBox}`,
				duration: 3000,
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update box quantity",
				variant: "default",
				duration: 3000,
				style: { backgroundColor: "#f8fafc", color: "#333" },
			});
		}
	};

	return (
		<div className="flex h-full w-full flex-col justify-between gap-y-4">
			<div className="flex h-full min-h-0 w-full flex-col gap-y-4">
				<h1 className="text-2xl font-semibold">{product.name}</h1>
				<div className="flex justify-between">
					<div className="flex w-full flex-col gap-y-4">
						<div className="flex gap-x-8">
							<Label label="Stock">
								<p
									id="stock"
									className={product.stock < 0 ? "text-red-500" : ""}
								>
									{product.stock}
								</p>
							</Label>
							<Label label="Buy Price">
								<p id="buyPrice">
									{currencyFormatter.format(product.buyPrice / 100)}
								</p>
							</Label>
							<Label label="Sell Price">
								<p id="sellPrice">
									{currencyFormatter.format(product.sellPrice / 100)}
								</p>
							</Label>
						</div>
						<Label label="Category">
							<p id="category">{product.category.description}</p>
						</Label>
					</div>
					<div
						className="flex cursor-pointer flex-col items-center self-center transition-all hover:scale-110"
						onClick={() => {
							navigator.clipboard.writeText(product.barcode);
							toast({ title: "Barcode copied to clipboard", duration: 2000 });
						}}
					>
						<Barcode
							barcode={product.barcode}
							width={3}
							height={80}
							displayInvalid
							background="transparent"
						/>
					</div>
				</div>
				<hr />
				<div className="flex h-full min-h-0 gap-x-1">
					<div className="flex h-full w-[47%] min-w-0 flex-col gap-y-2 max-w-xl px-3">
						<h3 className="text-lg font-semibold">Attached Boxes</h3>
						<AttachedBoxesList
							boxes={boxes || []}
							barcode={product.barcode}
							onUpdateBox={handleUpdateBox}
						/>
					</div>
					<div className="flex h-full w-[53%] min-w-0 flex-col justify-between gap-y-4 pb-8 max-w-xl">
						<div className="flex h-full min-h-0 flex-col gap-y-2">
							<h3 className="text-lg font-semibold">Popularity Graph</h3>
							<div className="flex h-full items-center justify-center rounded-lg border p-2">
								<p>Placeholder</p>
							</div>
						</div>
						<div className="flex justify-end gap-x-4">
							<Button asChild>
								<Link href={`/admin/products/${product.barcode}/edit`}>
									Edit Product Details
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
