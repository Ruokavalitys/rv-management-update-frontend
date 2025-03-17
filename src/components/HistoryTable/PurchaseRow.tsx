import { Purchase } from "@/server/requests/historyRequests";
import Link from "next/link";

export const PurchaseRow = ({ purchase }: { purchase: Purchase }) => {
	// Helper function to format date in Finnish format (DD/MM/YYYY HH:MM:SS, 24-hour clock)
	const formatDateTime = (date: Date) => {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
		const year = date.getFullYear();
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
	};

	return (
		<div
			key={`purchase-${purchase.purchaseId}`}
			className="inline-grid w-full cursor-pointer grid-cols-5 px-4 py-4 transition-all hover:bg-red-50 border-l-2 border-red-600" // Changed to hover:bg-red-50
		>
			<div className="whitespace-nowrap">
				<h3 className="text-lg font-semibold text-black">
					{purchase.user.username}
				</h3>
				<p className="text-sm text-stone-500 text-black">
					{purchase.user.fullName}
				</p>
			</div>

			<div className="place-self-center self-center">
				<p>{formatDateTime(new Date(Date.parse(purchase.time)))}</p>
			</div>

			<div className="place-self-center self-center">
				{purchase.returned ? null : <p className="text-red-600">Purchased</p>}
			</div>

			<div className="place-self-center self-center">
				<Link
					href={`/admin/products/${purchase.product.barcode}`}
					className="block text-center"
				>
					{purchase.product.name}
				</Link>
			</div>

			<div className="flex flex-col items-end">
				<p className="text-sm text-stone-300">
					<span
						className={`font-semibold ${
							purchase.balanceAfter + purchase.price < 0 ? "text-red-500" : ""
						}`}
					>
						{((purchase.balanceAfter + purchase.price) / 100).toFixed(2)} €
					</span>{" "}
					<span className="text-lg font-semibold text-red-600">
						- {(purchase.price / 100).toFixed(2)} €
					</span>{" "}
					={" "}
					<span
						className={`font-semibold ${
							purchase.balanceAfter < 0 ? "text-red-500" : ""
						}`}
					>
						{(purchase.balanceAfter / 100).toFixed(2)}
					</span>{" "}
					€
				</p>
				<p className="text-sm text-stone-500 text-black">
					{purchase.user.email}
				</p>{" "}
				{/* Removed font-bold */}
			</div>
		</div>
	);
};
