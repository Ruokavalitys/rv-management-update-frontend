"use client";

import BoxCreationForm from "@/components/BoxCreationForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getProduct } from "@/server/requests/productRequests";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BoxPromptPage({
	params,
}: {
	params: { barcode: string };
}) {
	const router = useRouter();
	const { toast } = useToast();
	const [showBoxForm, setShowBoxForm] = useState(false);
	const [productName, setProductName] = useState<string>("product");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const product = await getProduct(params.barcode);
				setProductName(product?.name || "product");
			} catch (err) {
				console.error("Failed to fetch product:", err);
				setProductName("product");
			} finally {
				setIsLoading(false);
			}
		};
		fetchProduct();
	}, [params.barcode]);

	const handleNoBox = () => {
		toast({
			title: "No Box Attached",
			description: `Proceeding to buy-in for ${productName}.`,
			duration: 4000,
		});
		router.push(`/admin/buy_in/product/${params.barcode}`);
	};

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<p className="text-sm text-stone-700">Loading...</p>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full items-center justify-center">
			{showBoxForm ? (
				<div className="flex max-h-screen flex-col items-start gap-y-4 pb-8 pt-4">
					<div className="w-96">
						<h1 className="text-3xl font-semibold">Attach Box</h1>
					</div>
					<div className="flex w-full items-center justify-center">
						<div className="flex w-96 flex-col items-center gap-y-6 rounded-lg border border-stone-300 bg-white p-8 shadow-md">
							<BoxCreationForm
								productBarcode={params.barcode}
								onSuccess={() =>
									router.push(`/admin/buy_in/product/${params.barcode}`)
								}
								onCancel={handleNoBox}
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="flex w-96 flex-col items-center gap-y-6 rounded-lg border border-stone-300 bg-white p-8 shadow-md">
					<h1 className="text-2xl font-semibold">Attach Box?</h1>
					<p className="text-sm text-stone-700 text-center">
						Do you want to attach a box to {productName}?
					</p>
					<div className="flex w-full gap-x-4">
						<Button
							onClick={() => setShowBoxForm(true)}
							className="flex-1"
							aria-label={`Attach a box for ${productName}`}
							autoFocus
						>
							Attach Box
						</Button>
						<Button
							variant="outline"
							onClick={handleNoBox}
							className="flex-1"
							aria-label="Proceed without attaching a box"
						>
							No Box
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
