"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { calculateMargin, calculateSellPrice } from "@/lib/marginUtils";
import { buyInProductAction } from "@/server/actions/products";
import { buyInBox } from "@/server/requests/boxRequests";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BoxData = {
	boxBarcode: string;
	itemsPerBox: number;
	productBarcode: string;
	productName: string;
	buyPrice?: number;
	sellPrice?: number;
	productStock?: number;
};

type ProductData = {
	barcode: string;
	name: string;
	stock: number;
	buyPrice?: number;
	sellPrice?: number;
	category: { categoryId: number; description: string };
};

export default function BuyInFormClient({
	box,
	product,
	defaultMargin,
}: {
	box: BoxData | null;
	product: ProductData | null;
	defaultMargin: number;
}) {
	const [boxCount, setBoxCount] = useState<string>("1");
	const [productQuantity, setProductQuantity] = useState<string>("1");
	const [boxBuyPrice, setBoxBuyPrice] = useState<string>("");
	const [buyPrice, setBuyPrice] = useState<string>("");
	const [sellPrice, setSellPrice] = useState<string>("");
	const [isCustomMargin, setIsCustomMargin] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage] = useState<string | null>(
		box
			? "Box found in the database!"
			: product
				? "Product found in the database!"
				: null,
	);
	const { toast } = useToast();
	const router = useRouter();

	const initialBuyPrice = box ? box.buyPrice : product ? product.buyPrice : 0;
	const initialSellPrice = box
		? box.sellPrice
		: product
			? product.sellPrice
			: 0;
	const initialMargin =
		initialBuyPrice && initialSellPrice
			? calculateMargin(
					(initialBuyPrice / 100).toFixed(2),
					(initialSellPrice / 100).toFixed(2),
					defaultMargin,
				)
			: defaultMargin;

	const [activeMargin, setActiveMargin] = useState<number>(initialMargin);

	useEffect(() => {
		const buy =
			buyPrice ||
			(box
				? (box.buyPrice! / 100).toFixed(2)
				: product
					? (product.buyPrice! / 100).toFixed(2)
					: "0");
		const sell =
			sellPrice ||
			(box
				? (box.sellPrice! / 100).toFixed(2)
				: product
					? (product.sellPrice! / 100).toFixed(2)
					: "0");
		const margin = calculateMargin(buy, sell, defaultMargin);
		setActiveMargin(margin);
	}, [buyPrice, sellPrice, box, product, defaultMargin]);

	const handleBoxBuyPriceChange = (value: string) => {
		setBoxBuyPrice(value);
		if (value === "" || !box) {
			setBuyPrice("");
			setSellPrice("");
			setIsCustomMargin(false);
		} else {
			const boxPriceNum = parseFloat(value);
			if (!isNaN(boxPriceNum) && boxPriceNum >= 0 && box.itemsPerBox > 0) {
				const individualBuyPrice = (
					Math.ceil((boxPriceNum / box.itemsPerBox) * 100) / 100
				).toFixed(2);
				setBuyPrice(individualBuyPrice);
				if (!isCustomMargin) {
					const newSellPrice = calculateSellPrice(
						individualBuyPrice,
						defaultMargin,
					);
					setSellPrice(newSellPrice);
				}
			} else {
				setBuyPrice("");
				setSellPrice("");
				setIsCustomMargin(false);
			}
		}
	};

	const handleBuyPriceChange = (value: string) => {
		setBuyPrice(value);
		setBoxBuyPrice("");
		if (value === "") {
			setSellPrice("");
			setIsCustomMargin(false);
		} else if (!isCustomMargin) {
			const newSellPrice = calculateSellPrice(value, defaultMargin);
			setSellPrice(newSellPrice);
		}
	};

	const handleSellPriceChange = (value: string) => {
		setSellPrice(value);
		if (value === "") {
			setIsCustomMargin(false);
		} else {
			setIsCustomMargin(true);
		}
	};

	const handleClear = () => {
		setBoxCount("1");
		setProductQuantity("1");
		setBoxBuyPrice("");
		setBuyPrice("");
		setSellPrice("");
		setIsCustomMargin(false);
		setActiveMargin(initialMargin);
		setError(null);
		router.push("/admin/buy_in");
	};

	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				handleClear();
			}
		};
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("keydown", handleEsc);
		};
	}, [initialMargin, router]);

	const handleBoxBuyIn = async () => {
		if (!box || !boxCount) {
			setError("Please enter a valid number of boxes");
			return;
		}

		const boxCountNum = Number(boxCount);
		if (isNaN(boxCountNum) || boxCountNum <= 0) {
			setError("Please enter a valid number of boxes");
			return;
		}

		try {
			const finalBuyPrice = buyPrice
				? Math.ceil(Number(buyPrice) * 100)
				: box.buyPrice!;
			const finalSellPrice = sellPrice
				? Math.ceil(Number(sellPrice) * 100)
				: box.sellPrice!;
			if (!finalBuyPrice || !finalSellPrice) {
				setError("Please enter valid buy and sell prices");
				return;
			}
			if (finalBuyPrice <= 0 || finalSellPrice <= 0) {
				setError("Buy and sell prices must be greater than 0");
				return;
			}

			await buyInBox({
				barcode: box.boxBarcode,
				boxCount: boxCountNum,
				productBuyPrice: finalBuyPrice,
				productSellPrice: finalSellPrice,
			});

			const totalItemsAdded = boxCountNum * box.itemsPerBox;
			const truncatedProductName =
				box.productName.length > 50
					? box.productName.substring(0, 47) + "..."
					: box.productName;
			toast({
				title: "Buy-In Successful",
				description: `Added ${totalItemsAdded} items of ${truncatedProductName} (${box.productBarcode}) (${boxCountNum} box(es) with barcode ${box.boxBarcode})`,
				duration: 3000,
			});
			router.push(`/admin/buy_in`);
			router.refresh();
		} catch (err: any) {
			setError("Failed to add boxes to inventory");
		}
	};

	const handleProductBuyIn = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!product || !productQuantity) {
			setError("Quantity must be a number greater than 0");
			return;
		}

		const quantityNum = Number(productQuantity);
		if (isNaN(quantityNum) || quantityNum <= 0) {
			setError("Quantity must be a number greater than 0");
			return;
		}

		try {
			const finalBuyPrice = buyPrice
				? Math.ceil(Number(buyPrice) * 100)
				: (product.buyPrice ?? 0);
			const finalSellPrice = sellPrice
				? Math.ceil(Number(sellPrice) * 100)
				: (product.sellPrice ?? 0);
			if (!finalBuyPrice || !finalSellPrice) {
				setError("Please enter valid buy and sell prices");
				return;
			}
			if (finalBuyPrice <= 0 || finalSellPrice <= 0) {
				setError("Buy and sell prices must be greater than 0");
				return;
			}

			const formData = new FormData();
			formData.append("barcode", product.barcode);
			formData.append("count", quantityNum.toString());
			formData.append("buyPrice", finalBuyPrice.toString());
			formData.append("sellPrice", finalSellPrice.toString());

			const result = await buyInProductAction(null, formData);
			if (result.success && result.newStock) {
				const truncatedProductName =
					product.name.length > 50
						? product.name.substring(0, 47) + "..."
						: product.name;
				toast({
					title: "Buy-In Successful",
					description: `Added ${productQuantity} items of product ${truncatedProductName}`,
					duration: 3000,
				});
				router.push(`/admin/buy_in`);
				router.refresh();
			} else {
				setError("Failed to add product to stock");
			}
		} catch (err: any) {
			setError("Failed to add product to stock");
		}
	};

	const totalItems = box && boxCount ? Number(boxCount) * box.itemsPerBox : 0;
	const totalBoxBuyValue =
		box && boxCount
			? (buyPrice
					? (Math.ceil(Number(buyPrice) * 100) / 100) * totalItems
					: (box.buyPrice! / 100) * totalItems
				)
					.toFixed(2)
					.replace(".", ",")
			: "0,00";
	const newBoxStock =
		box && boxCount ? (box.productStock ?? 0) + totalItems : 0;

	const totalProductBuyValue =
		product && productQuantity
			? (buyPrice
					? (Math.ceil(Number(buyPrice) * 100) / 100) * Number(productQuantity)
					: (product.buyPrice! / 100) * Number(productQuantity)
				)
					.toFixed(2)
					.replace(".", ",")
			: "0,00";
	const newProductStock =
		product && productQuantity
			? (product.stock ?? 0) + Number(productQuantity)
			: 0;

	const formatPriceForDisplay = (priceInCents?: number) => {
		if (priceInCents === undefined || priceInCents === null) return "N/A";
		if (typeof priceInCents !== "number") return "Error";
		return `${(priceInCents / 100).toFixed(2).replace(".", ",")} €`;
	};

	const isDefaultMargin = Math.abs(activeMargin - defaultMargin) < 0.001;

	return (
		<div className="flex h-full w-full items-center justify-center">
			<div className="flex w-fit flex-col items-start gap-y-4">
				<div className="flex flex-col items-center rounded-lg border border-stone-300 bg-white p-6 shadow-lg w-96">
					<div className="flex flex-col gap-y-3 w-full">
						{box ? (
							<div className="flex flex-col gap-y-2">
								<div className="flex flex-col gap-y-1">
									<div className="flex justify-between items-start">
										<p className="text-sm">
											<strong>Box Barcode:</strong> {box.boxBarcode}
										</p>
										<Button
											variant="outline"
											className="h-6 w-6 p-1"
											onClick={handleClear}
											type="button"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									{successMessage && (
										<p className="text-sm text-green-500">{successMessage}</p>
									)}
								</div>
								<p className="text-sm">
									<strong>Items Per Box:</strong> {box.itemsPerBox}
								</p>
								<div
									className="text-sm break-words"
									style={{
										maxWidth: "100%",
										wordBreak: "break-all",
									}}
								>
									<strong>Product Name:</strong> {box.productName}
								</div>
								<p className="text-sm">
									<strong>Product Barcode:</strong> {box.productBarcode}
								</p>
								<p className="text-sm">
									<strong>Current Stock:</strong> {box.productStock ?? "N/A"}
								</p>
								<div>
									<label htmlFor="boxCount" className="text-sm text-stone-700">
										Number of Boxes
									</label>
									<Input
										id="boxCount"
										name="boxCount"
										type="number"
										value={boxCount}
										onChange={(e) => setBoxCount(e.target.value)}
										className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</div>
								<div>
									<label
										htmlFor="boxBuyPrice"
										className="text-sm text-stone-700"
									>
										Box Buy Price (optional)
									</label>
									<Input
										id="boxBuyPrice"
										name="boxBuyPrice"
										type="number"
										value={boxBuyPrice}
										onChange={(e) => handleBoxBuyPriceChange(e.target.value)}
										min={0}
										step="0.01"
										placeholder=""
										className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</div>
								<div>
									<label htmlFor="buyPrice" className="text-sm text-stone-700">
										Adjust Buy Price (optional)
									</label>
									<Input
										id="buyPrice"
										name="buyPrice"
										type="number"
										value={buyPrice}
										onChange={(e) => handleBuyPriceChange(e.target.value)}
										min={0}
										step="0.01"
										placeholder={formatPriceForDisplay(box.buyPrice)}
										className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</div>
								<div>
									<label htmlFor="sellPrice" className="text-sm text-stone-700">
										Adjust Sell Price (optional)
									</label>
									<Input
										id="sellPrice"
										name="sellPrice"
										type="number"
										value={sellPrice}
										onChange={(e) => handleSellPriceChange(e.target.value)}
										min={0}
										step="0.01"
										placeholder={formatPriceForDisplay(box.sellPrice)}
										className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</div>
								<div className="text-sm text-stone-500">
									{isDefaultMargin
										? `Default margin applied: ${(defaultMargin * 100).toFixed(2)}%`
										: `Current margin: ${(activeMargin * 100).toFixed(2)}% (Default margin: ${(defaultMargin * 100).toFixed(2)}%)`}
								</div>
								{box && (
									<div className="flex flex-col gap-y-1">
										<p className="text-sm">
											<strong>Total items to add:</strong> {totalItems}
											{totalItems > 0 && ` (new stock: ${newBoxStock})`}
										</p>
										<p className="text-sm">
											<strong>Items total value:</strong> {totalBoxBuyValue} €
										</p>
									</div>
								)}
								<Button onClick={handleBoxBuyIn} className="mt-2">
									Confirm Buy-In (Box)
								</Button>
							</div>
						) : product ? (
							<form
								onSubmit={handleProductBuyIn}
								className="flex flex-col gap-y-2"
							>
								<div className="flex flex-col gap-y-1">
									<div className="flex justify-between items-start">
										<p className="text-sm">
											<strong>Product Barcode:</strong> {product.barcode}
										</p>
										<Button
											variant="outline"
											className="h-6 w-6 p-1"
											onClick={handleClear}
											type="button"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									{successMessage && (
										<p className="text-sm text-green-500">{successMessage}</p>
									)}
								</div>
								<div
									className="text-sm break-words"
									style={{
										maxWidth: "100%",
										wordBreak: "break-all",
									}}
								>
									<strong>Product Name:</strong> {product.name}
								</div>
								<p className="text-sm">
									<strong>Current Stock:</strong> {product.stock}
								</p>
								<div>
									<label htmlFor="count" className="text-sm text-stone-700">
										Quantity
									</label>
									<Input
										id="count"
										name="count"
										type="number"
										value={productQuantity}
										onChange={(e) => setProductQuantity(e.target.value)}
										className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</div>
								<div>
									<label htmlFor="buyPrice" className="text-sm text-stone-700">
										Adjust Buy Price (optional)
									</label>
									<Input
										id="buyPrice"
										name="buyPrice"
										type="number"
										value={buyPrice}
										onChange={(e) => handleBuyPriceChange(e.target.value)}
										min={0}
										step="0.01"
										placeholder={formatPriceForDisplay(product.buyPrice)}
										className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</div>
								<div>
									<label htmlFor="sellPrice" className="text-sm text-stone-700">
										Adjust Sell Price (optional)
									</label>
									<Input
										id="sellPrice"
										name="sellPrice"
										type="number"
										value={sellPrice}
										onChange={(e) => handleSellPriceChange(e.target.value)}
										min={0}
										step="0.01"
										placeholder={formatPriceForDisplay(product.sellPrice)}
										className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</div>
								<div className="text-sm text-stone-500">
									{isDefaultMargin
										? `Default margin applied: ${(defaultMargin * 100).toFixed(2)}%`
										: `Current margin: ${(activeMargin * 100).toFixed(2)}% (Default margin: ${(defaultMargin * 100).toFixed(2)}%)`}
								</div>
								{product && (
									<div className="flex flex-col gap-y-1">
										<p className="text-sm">
											<strong>Total items to add:</strong>{" "}
											{productQuantity ? Number(productQuantity) : 0}
											{productQuantity &&
												Number(productQuantity) > 0 &&
												` (new stock: ${newProductStock})`}
										</p>
										<p className="text-sm">
											<strong>Items total value:</strong> {totalProductBuyValue}{" "}
											€
										</p>
									</div>
								)}
								<Button type="submit" className="mt-2">
									Confirm Buy-In (Product)
								</Button>
							</form>
						) : (
							<div>
								<p className="text-sm text-black-500">Loading data...</p>
							</div>
						)}
						{error && <p className="text-sm text-red-500">{error}</p>}
					</div>
				</div>
			</div>
		</div>
	);
}
