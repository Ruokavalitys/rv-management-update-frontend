import { formatDateTime } from "@/lib/dateUtils";
import { Purchase } from "@/server/requests/historyRequests";
import Link from "next/link";

export const ReturnedRow = ({ purchase, isAdmin, }: { purchase: Purchase; isAdmin: boolean; }) => {
	return (
		<div
      key={`return-${purchase.purchaseId}`}
			className="inline-grid w-full cursor-pointer grid-cols-4 px-4 py-4 transition-all hover:bg-blue-50"
		>
			<div className="whitespace-nowrap">
				<p>{formatDateTime(new Date(Date.parse(purchase.returnedTime)))}</p>
			</div>

			<div className="place-self-center self-center">
				<p className="text-blue-600">Returned</p>
			</div>

			<div className="place-self-center self-center">
				{isAdmin ? (
					<Link
						href={`/admin/products/${purchase.product.barcode}`}
						className="block text-center hover:text-blue-600"
					>
						{purchase.product.name}
					</Link>
				) : (
					<p>{purchase.product.name}</p>
				)}
			</div>

			<div className="flex flex-col items-end">
				<p className="text-sm text-stone-300">
					<span
						className={`font-semibold ${
              				purchase.returnedBalanceAfter - purchase.price < 0 ? "text-red-500" : ""
            			}`}
					>
						{((purchase.returnedBalanceAfter - purchase.price) / 100).toFixed(2)} €
					</span>{" "}
					<span className="text-lg font-semibold text-blue-600">
						{purchase.returnedBalanceAfter - purchase.price < purchase.returnedBalanceAfter
							? `+ ${(Math.abs(purchase.price) / 100).toFixed(2)} €`
							: `- ${(Math.abs(purchase.price) / 100).toFixed(2)} €`}
					</span>{" "}
					={" "}
					<span
						className={`font-semibold ${
              				purchase.returnedBalanceAfter < 0 ? "text-red-500" : ""
            			}`}
					>
						{(purchase.returnedBalanceAfter / 100).toFixed(2)}
					</span>{" "}
					€
				</p>
			</div>
		</div>
	);
};