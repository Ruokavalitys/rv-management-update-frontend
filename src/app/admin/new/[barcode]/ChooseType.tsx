"use client";

import Barcode from "@/components/Barcode";
import { Button } from "@/components/ui/button";
import { moveWithArrowKeys } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useRef } from "react";

export const ChooseType = ({ barcode }: { barcode: string }) => {
	const createProduct = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		createProduct.current?.focus();

		const handleHotkeys = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (key === "p") {
				document.getElementById("create-product")?.click();
			} else if (key === "b") {
				document.getElementById("create-box")?.click();
			} else if (key === "c") {
				document.getElementById("cancel")?.click();
			}
		};

		window.addEventListener("keydown", handleHotkeys);
		return () => window.removeEventListener("keydown", handleHotkeys);
	}, []);

	return (
		<>
			<h1 className="text-3xl font-semibold">Choose type</h1>
			<div className="flex flex-col items-center gap-y-4 overflow-y-auto rounded-lg border border-stone-300 bg-white p-8 text-lg shadow-lg">
				<p>The barcode was not found in the database.</p>
				<Barcode barcode={barcode} displayInvalid />
				<p>Do you want to create a new product or a new box?</p>
				<div
					className="flex w-full justify-between gap-x-4"
					onKeyDown={moveWithArrowKeys}
				>
					<Button
						ref={createProduct}
						asChild
						data-next="create-box"
						id="create-product"
						title="Shortcut: P"
					>
						<Link href={`/admin/new/product?barcode=${barcode}`}>
							Create [P]roduct
						</Link>
					</Button>
					<Button
						asChild
						data-next="cancel"
						id="create-box"
						title="Shortcut: B"
					>
						<Link href={`/admin/new/${barcode}/new-box`}>Create [B]ox</Link>
					</Button>
					<Button asChild variant="outline" id="cancel" title="Shortcut: C">
						<Link href={`/admin/buy_in`}>[C]ancel</Link>
					</Button>
				</div>
			</div>
		</>
	);
};
