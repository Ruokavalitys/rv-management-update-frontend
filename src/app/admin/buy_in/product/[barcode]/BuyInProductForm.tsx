"use client";

import Barcode from "@/components/Barcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { calculateSellPrice } from "@/lib/marginUtils";
import { nextFieldOnEnter } from "@/lib/utils";
import { buyInProductAction } from "@/server/actions/products";
import { Product, addStockResponse } from "@/server/requests/productRequests";
import { Loader, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

type OwnProps = { product: Product; defaultMargin: number };

export default function BuyInProductForm({ product, defaultMargin }: OwnProps) {
	const [count, setCount] = useState<number | undefined>(undefined);
	const [buyPrice, setBuyPrice] = useState<string>(
		(product.buyPrice / 100).toFixed(2),
	);
	const [sellPrice, setSellPrice] = useState<string>(
		(product.sellPrice / 100).toFixed(2),
	);
	const [isCustomMargin, setIsCustomMargin] = useState(false);

	const initialMargin =
		product.buyPrice && product.sellPrice
			? ((product.sellPrice / product.buyPrice) * 100 - 100) / 100
			: defaultMargin;

	const [activeMargin, setActiveMargin] = useState<number>(initialMargin);

	useEffect(() => {
		const buy = parseFloat(buyPrice || (product.buyPrice / 100).toFixed(2));
		const sell = parseFloat(sellPrice || (product.sellPrice / 100).toFixed(2));
		if (buy && sell && buy > 0) {
			const margin = (sell / buy) * 100 - 100;
			setActiveMargin(margin / 100);
		} else {
			setActiveMargin(defaultMargin);
		}
	}, [buyPrice, sellPrice, product, defaultMargin]);

	const { barcode } = product;

	const initialState = { success: false };
	const [state, buyInProduct] = useFormState<
		{ success: boolean; newStock?: addStockResponse; error?: unknown },
		FormData
	>(buyInProductAction, initialState);

	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		if (state.success && state.newStock) {
			toast({
				title: "Buy In Successful",
				description: `Bought in ${count} pcs of ${product.name}`,
				duration: 6000,
			});
			router.push(`/admin/buy_in`);
		}
	}, [state.success, state.newStock, router, count, product.name, toast]);

	const { pending } = useFormStatus();

	const handleBuyPriceChange = (value: string) => {
		setBuyPrice(value);
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
		setCount(undefined);
		setBuyPrice((product.buyPrice / 100).toFixed(2));
		setSellPrice((product.sellPrice / 100).toFixed(2));
		setIsCustomMargin(false);
		setActiveMargin(initialMargin);
		router.push(`/admin/buy_in`);
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
	}, [initialMargin, product.buyPrice, product.sellPrice, router]);

	const totalBuyValue =
		count && buyPrice
			? (Number(buyPrice) * count).toFixed(2).replace(".", ",")
			: "0,00";

	const isDefaultMargin = Math.abs(activeMargin - defaultMargin) < 0.001;

	return (
		<>
			<div
				className="flex flex-col items-center gap-y-4"
				onKeyDown={nextFieldOnEnter}
			>
				<div className="flex justify-between items-start w-full">
					<p className="text-lg font-semibold">{product.name}</p>
					<Button
						variant="outline"
						className="h-6 w-6 p-1"
						onClick={handleClear}
						type="button"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<Barcode barcode={barcode} width={3} height={60} />
				<Input
					containerClassName="hidden"
					id="barcode"
					name="barcode"
					type="hidden"
					value={barcode}
					readOnly
				/>
				<div>
					<label htmlFor="count" className="text-sm text-stone-700">
						Count
					</label>
					<Input
						id="count"
						name="count"
						placeholder="Enter Count"
						value={count}
						onChange={({ target }) => setCount(Number(target.value))}
						required
						autoFocus
						data-next="buyPrice"
					/>
				</div>
				<div>
					<label htmlFor="buyPrice" className="text-sm text-stone-500">
						Buy Price
					</label>
					<Input
						id="buyPrice"
						name="buyPrice"
						type="number"
						placeholder="Buy Price"
						data-next="sellPrice"
						step={0.01}
						className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						value={buyPrice}
						onChange={({ target }) => handleBuyPriceChange(target.value)}
					/>
				</div>
				<div>
					<label htmlFor="sellPrice" className="text-sm text-stone-500">
						Sell Price
					</label>
					<Input
						id="sellPrice"
						name="sellPrice"
						type="number"
						placeholder="Sell Price"
						data-next="buyInSubmit"
						step={0.01}
						value={sellPrice}
						onChange={({ target }) => handleSellPriceChange(target.value)}
						className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					/>
				</div>
				<div className="text-sm text-stone-500">
					{isDefaultMargin
						? `Default margin applied: ${(defaultMargin * 100).toFixed(0)}%`
						: `Current margin: ${(activeMargin * 100).toFixed(0)}% (Default margin: ${(defaultMargin * 100).toFixed(0)}%)`}
				</div>
				<div className="flex flex-col gap-y-1">
					<p className="text-sm">
						<strong>Total items to add:</strong> {count || 0}
					</p>
					<p className="text-sm">
						<strong>Items Total Value:</strong> {totalBuyValue} €
					</p>
				</div>
			</div>
			<div className="mt-3 flex flex-row-reverse justify-between gap-x-4">
				<Button
					id="buyInSubmit"
					formAction={buyInProduct}
					type="submit"
					className="flex w-full items-center gap-x-2"
				>
					{pending && <Loader className="animate-spin" />}
					Buy In
				</Button>
				<Button asChild variant={"outline"} className="w-full">
					<Link href={`/admin/buy_in`}>Cancel</Link>
				</Button>
			</div>
		</>
	);
}
