import { formatDateTime } from "@/lib/dateUtils";
import { Purchase } from "@/server/requests/historyRequests";
import Link from "next/link";

export const PurchaseRow = ({ purchase }: { purchase: Purchase }) => {
	return (
		<div
			key={`purchase-${purchase.purchaseId}`}
			className="inline-grid w-full cursor-pointer grid-cols-5 px-4 py-4 transition-all hover:bg-red-50"
		>
			<div className="whitespace-nowrap">
				<Link href={`/admin/users/${purchase.user.userId}`} className="group">
					<h3 className="text-lg font-semibold text-black group-hover:text-red-500">
						{purchase.user.username}
					</h3>
					<p className="text-sm text-stone-500 text-black group-hover:text-red-500">
						{purchase.user.fullName}
					</p>
				</Link>
			</div>

			<div className="place-self-center self-center">
				<p>{formatDateTime(new Date(Date.parse(purchase.time)))}</p>
			</div>

			<div className="place-self-center self-center">
				{purchase.returned ? <p className="text-red-600">Returned purchase</p> : <p className="text-red-600">Purchased</p>}
			</div>

			<div className="place-self-center self-center">
				<Link
					href={`/admin/products/${purchase.product.barcode}`}
					className="block text-center hover:text-red-500"
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
						{purchase.balanceAfter + purchase.price > purchase.balanceAfter
							? `- ${(Math.abs(purchase.price) / 100).toFixed(2)} €`
							: `+ ${(Math.abs(purchase.price) / 100).toFixed(2)} €`}
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
			</div>
		</div>
	);
};
