import { Deposit } from "@/server/requests/historyRequests";

const depositTypeMapping: { [key: number]: string } = {
	17: "Deposit",
	26: "Cash",
	27: "Bank Transfer",
};

export const DepositRow = ({ deposit }: { deposit: Deposit }) => {
	const formatDateTime = (date: Date) => {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
	};

	return (
		<div
			key={`deposit-${deposit.depositId}`}
			className="inline-grid w-full cursor-pointer grid-cols-5 px-4 py-4 transition-all hover:bg-green-50 border-l-2 border-green-700"
		>
			<div className="whitespace-nowrap">
				<h3 className="text-lg font-semibold text-black">
					{deposit.user.username}
				</h3>
				<p className="text-sm text-stone-500 text-black">
					{deposit.user.fullName}
				</p>
			</div>

			<div className="place-self-center self-center">
				<p>{formatDateTime(new Date(Date.parse(deposit.time)))}</p>
			</div>

			<div className="place-self-center self-center">
				<p className="text-green-700">Deposited</p>
			</div>

			<div className="place-self-center self-center">
				<p>{depositTypeMapping[deposit.type]}</p>
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
				<p className="text-sm text-stone-500 text-black">
					{deposit.user.email}
				</p>{" "}
			</div>
		</div>
	);
};
