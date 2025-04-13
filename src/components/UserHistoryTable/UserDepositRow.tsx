import { formatDateTime } from "@/lib/dateUtils";
import { Deposit } from "@/server/requests/historyRequests";

const depositTypeMapping: { [key: number]: string } = {
	17: "Deposit",
	26: "Cash deposit",
	27: "Bank transfer",
};

export const DepositRow = ({ deposit }: { deposit: Deposit }) => {
	return (
		<div
			key={`deposit-${deposit.depositId}`}
			className="inline-grid w-full cursor-pointer grid-cols-4 px-4 py-4 transition-all hover:bg-green-50"
		>
			<div className="whitespace-nowrap">
				<p>{formatDateTime(new Date(Date.parse(deposit.time)))}</p>
			</div>

			<div className="place-self-center self-center">
				<p className="text-green-700">{depositTypeMapping[deposit.type]}</p>
			</div>

			<div className="place-self-center self-center">
				<p></p>
			</div>

			<div className="flex flex-col items-end">
				<p className="text-sm text-stone-300">
					<span
						className={`font-semibold ${
							deposit.balanceAfter - deposit.amount < 0 ? "text-red-500" : ""
						}`}
					>
						{((deposit.balanceAfter - deposit.amount) / 100).toFixed(2)} €
					</span>{" "}
					<span className="text-lg font-semibold text-green-700">
						+ {(deposit.amount / 100).toFixed(2)} €
					</span>{" "}
					={" "}
					<span
						className={`font-semibold ${
							deposit.balanceAfter < 0 ? "text-red-500" : ""
						}`}
					>
						{(deposit.balanceAfter / 100).toFixed(2)}
					</span>{" "}
					€
				</p>
			</div>
		</div>
	);
};