"use client";

import Barcode from "@/components/Barcode";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

type Box = {
	boxBarcode: string;
	itemsPerBox: number;
};

type OwnProps = {
	boxes: Box[];
	barcode: string;
};

const AttachedBoxesList = ({ boxes, barcode }: OwnProps) => {
	const { toast } = useToast();

	return (
		<div className="flex h-full min-h-0 flex-col">
			<Button asChild variant="outline" className="z-10 mr-3 bg-white">
				<Link href={`/admin/products/${barcode}/attach-box`}>Attach Box</Link>
			</Button>
			<div className="-mt-2 h-full min-h-0 overflow-y-auto overscroll-none">
				<div className="flex flex-col gap-y-4 pb-8 pt-6">
					{boxes.length === 0 && (
						<p className="text-center text-stone-500">No boxes attached</p>
					)}
					{boxes.map((box) => (
						<div
							key={box.boxBarcode}
							className="mr-3 flex items-start justify-between rounded-lg border py-2 pl-4 transition-all hover:bg-stone-100"
						>
							<div className="flex w-full items-center">
								<p className="text-lg font-semibold">
									{box.itemsPerBox}
									<span className="text-sm text-stone-500"> pcs</span>
								</p>
							</div>
							<div
								className="-m-2 scale-90 cursor-pointer transition-all hover:scale-100"
								onClick={() => {
									navigator.clipboard.writeText(box.boxBarcode);
									toast({
										title: "Box barcode copied to clipboard",
										duration: 2000,
									});
								}}
							>
								<Barcode
									barcode={box.boxBarcode}
									width={2}
									height={40}
									displayInvalid
									background="transparent"
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default AttachedBoxesList;
