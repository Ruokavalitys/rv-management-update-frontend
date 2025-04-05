"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { buyInProductAction } from "@/server/actions/products";
import { buyInBox, getAllBoxes } from "@/server/requests/boxRequests";
import { getAllProducts } from "@/server/requests/productRequests";
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
	category: {
		categoryId: number;
		description: string;
	};
};

export default function BuyInProductPage({
	params,
}: { params: { barcode: string } }) {
	const [box, setBox] = useState<BoxData | null>(null);
	const [product, setProduct] = useState<ProductData | null>(null);
	const [boxCount, setBoxCount] = useState<string>("1");
	const [productQuantity, setProductQuantity] = useState<string>("1");
	const [buyPrice, setBuyPrice] = useState<string>("");
	const [sellPrice, setSellPrice] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		if (!params.barcode) return;

		let mounted = true;

		const validateBarcode = async () => {
			try {
				const [boxes, products] = await Promise.all([
					getAllBoxes(),
					getAllProducts(),
				]);

				if (!mounted) return;

				const foundBox = boxes.find((b) => b.boxBarcode === params.barcode);
				if (foundBox) {
					setBox({
						boxBarcode: foundBox.boxBarcode,
						itemsPerBox: foundBox.itemsPerBox,
						productBarcode: foundBox.product.barcode,
						productName: foundBox.product.name,
						buyPrice: foundBox.product.buyPrice,
						sellPrice: foundBox.product.sellPrice,
						productStock: foundBox.product.stock,
					});
					setProduct(null);
					setError(null);
					setSuccessMessage("Box found in the database!");
					return;
				}

				const foundProduct = products.find((p) => p.barcode === params.barcode);
				if (foundProduct) {
					setProduct({
						barcode: foundProduct.barcode,
						name: foundProduct.name,
						stock: foundProduct.stock,
						buyPrice: foundProduct.buyPrice,
						sellPrice: foundProduct.sellPrice,
						category: foundProduct.category,
					});
					setBox(null);
					setError(null);
					setSuccessMessage("Product found in the database!");
					return;
				}

				router.push(`/admin/new/${params.barcode}`);
			} catch (err: any) {
				if (mounted) {
					setError(err.message || "Failed to fetch data");
					setBox(null);
					setProduct(null);
					setSuccessMessage(null);
				}
			}
		};

		validateBarcode();

		return () => {
			mounted = false;
		};
	}, [params.barcode, router]);

	const handleClear = () => {
		setBox(null);
		setProduct(null);
		setBoxCount("1");
		setProductQuantity("1");
		setBuyPrice("");
		setSellPrice("");
		setError(null);
		setSuccessMessage(null);
		router.push("/admin/buy_in");
	};

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
				? Math.round(Number(buyPrice) * 100)
				: box.buyPrice!;
			const finalSellPrice = sellPrice
				? Math.round(Number(sellPrice) * 100)
				: box.sellPrice!;

			if (!finalBuyPrice || !finalSellPrice) {
				setError("Please enter valid buy and sell prices");
				return;
			}

			await buyInBox({
				barcode: box.boxBarcode,
				boxCount: boxCountNum,
				productBuyPrice: finalBuyPrice,
				productSellPrice: finalSellPrice,
			});

			const totalItemsAdded = boxCountNum * box.itemsPerBox;

			toast({
				title: "Buy-In Successful",
				description: `Added ${totalItemsAdded} items of ${box.productName} (${box.productBarcode}) (${boxCountNum} box(es) with barcode ${box.boxBarcode})`,
				duration: 6000,
			});
			router.push(`/admin/products/${box.productBarcode}`);
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
		if (isNaN(quantityNum)) {
			setError("Quantity must be a number greater than 0");
			return;
		}
		if (quantityNum <= 0) {
			setError("Quantity must be a number greater than 0");
			return;
		}

		try {
			const finalBuyPrice = buyPrice
				? Math.round(Number(buyPrice) * 100)
				: product.buyPrice!;
			const finalSellPrice = sellPrice
				? Math.round(Number(sellPrice) * 100)
				: product.sellPrice!;

			if (!finalBuyPrice || !finalSellPrice) {
				setError("Please enter valid buy and sell prices");
				return;
			}

			const formData = new FormData();
			formData.append("barcode", product.barcode);
			formData.append("count", quantityNum.toString());
			formData.append("buyPrice", (finalBuyPrice / 100).toString());
			formData.append("sellPrice", (finalSellPrice / 100).toString());

			const result = await buyInProductAction(null, formData);

			if (result.success && result.newStock) {
				toast({
					title: "Buy-In Successful",
					description: `Added ${productQuantity} items of product ${product.name}`,
					duration: 6000,
				});
				router.push(`/admin/products/${product.barcode}`);
				router.refresh();
			} else {
				setError("Failed to add product to stock");
			}
		} catch (err: any) {
			setError("Failed to add product to stock");
		}
	};

	const totalItems = box && boxCount ? Number(boxCount) * box.itemsPerBox : 0;
	const newBoxStock =
		box && boxCount ? (box.productStock ?? 0) + totalItems : null;
	const newProductStock =
		product && productQuantity
			? (product.stock ?? 0) + Number(productQuantity)
			: null;

	const formatPriceForDisplay = (priceInCents?: number) => {
		if (priceInCents === undefined || priceInCents === null) return "N/A";
		if (typeof priceInCents !== "number") return "Error";
		return `${(priceInCents / 100).toFixed(2).replace(".", ",")} €`;
	};

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
								<p className="text-sm">
									<strong>Product Name:</strong> {box.productName}
								</p>
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
									<label htmlFor="buyPrice" className="text-sm text-stone-700">
										Adjust Buy Price (optional)
									</label>
									<Input
										id="buyPrice"
										name="buyPrice"
										type="number"
										value={buyPrice}
										onChange={(e) => setBuyPrice(e.target.value)}
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
										onChange={(e) => setSellPrice(e.target.value)}
										min={0}
										step="0.01"
										placeholder={formatPriceForDisplay(box.sellPrice)}
										className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</div>
								{boxCount && Number(boxCount) > 0 && (
									<p className="text-sm">
										<strong>Total items to add:</strong> {totalItems} (new
										stock: {newBoxStock})
									</p>
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
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									{successMessage && (
										<p className="text-sm text-green-500">{successMessage}</p>
									)}
								</div>
								<p className="text-sm">
									<strong>Product Name:</strong> {product.name}
								</p>
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
										onChange={(e) => setBuyPrice(e.target.value)}
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
										onChange={(e) => setSellPrice(e.target.value)}
										min={0}
										step="0.01"
										placeholder={formatPriceForDisplay(product.sellPrice)}
										className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</div>
								{productQuantity && Number(productQuantity) > 0 && (
									<p className="text-sm">
										<strong>Total items to add:</strong> {productQuantity} (new
										stock: {newProductStock})
									</p>
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
