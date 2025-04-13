"use client";

import { useToast } from "@/components/ui/use-toast";
import { currencyFormatter } from "@/lib/moneyFormatter";
import { isDeposit, isPurchase } from "@/lib/transactions";
import { merge } from "@/lib/utils";
import { Deposit, Purchase } from "@/server/requests/historyRequests";
import { Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PurchaseRow } from "@/components/UserHistoryTable/UserPurchaseRow";
import { DepositRow } from "@/components/UserHistoryTable/UserDepositRow";
import { ReturnedRow } from "@/components/UserHistoryTable/UserReturnedRow";


type UserType = {
	userId: number;
	username: string;
	fullName: string;
	email: string;
	moneyBalance: number;
	role: string;
};

export const UserView = ({
	user,
	depositHistory,
	purchaseHistory,
	returnHistory,
}: {
	user: UserType;
	depositHistory: Omit<Deposit, "user">[];
	purchaseHistory: Omit<Purchase, "user">[];
	returnHistory: Omit<Purchase, "user">[];
}) => {
	const { toast } = useToast();

	const [currentUsername, setCurrentUsername] = useState<string>("");
	const [view, setView] = useState<"overview" | "deposits" | "purchases" | "returns">(
		"overview",
	);

	const transactions = useMemo(() => {
		if (view === "overview") {
			return [...depositHistory, ...purchaseHistory, ...returnHistory].toSorted(
				(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
			);
		}
		if (view == "deposits") {
			return depositHistory
		}
		if (view == "purchases") {
			return purchaseHistory
		}
		if (view == "returns") {
			return returnHistory
		}
		return []
	}, [depositHistory, purchaseHistory, returnHistory, view]);

	useEffect(() => {
		const usernameElement = document.getElementById("current-username");
		if (usernameElement) {
			setCurrentUsername(usernameElement.innerText);
		} else {
			setCurrentUsername("admin_user");
		}
	}, []);

	return (
		<div className="flex h-full w-full flex-col gap-y-4">
			<div className="flex h-full w-full gap-4 divide-x">
				<div className="flex h-full min-w-48 flex-col gap-4">
					<div className="flex gap-4">
						<div className="flex flex-col">
							<h1 className="max-w-[15ch] text-2xl font-semibold">
								{user.username}
							</h1>
							<p className="text-stone-500">{user.fullName}</p>
						</div>
					</div>
					<div className="flex flex-col">
						<label htmlFor="email" className="text-sm text-stone-700">
							Email
						</label>
						<div className="group flex gap-2">
							<p id="email">{user.email}</p>
							<Copy
								width={14}
								className="hidden cursor-pointer group-hover:inline-block"
								onClick={() => {
									navigator.clipboard.writeText(user.email);
									toast({ title: "Email copied to clipboard", duration: 2000 });
								}}
							/>
						</div>
					</div>
					<div className="flex flex-col">
						<label htmlFor="role" className="text-sm text-stone-700">
							Role
						</label>
						<p id="role">{user.role}</p>
					</div>
					<div className="flex flex-col">
						<label htmlFor="balance" className="text-sm text-stone-700">
							Balance
						</label>
						<p
							id="balance"
							className={user.moneyBalance < 0 ? "text-red-500" : ""}
						>
							{(user.moneyBalance / 100).toFixed(2)} €
						</p>
					</div>
					<div className="flex flex-col">
						<label htmlFor="total-spent" className="text-sm text-stone-700">
							Total spent
						</label>
						<p id="total-spent">
							{currencyFormatter.format(
								purchaseHistory.reduce((acc, purchase) => {
									if (purchase.price <= 0 || purchase.returned) return acc;
									return acc + purchase.price;
								}, 0) / 100,
							)}
						</p>
					</div>
				</div>
				<div className="flex h-full w-full flex-col overflow-clip px-4 space-y-2">
					<div className="mb-2 flex gap-4 text-xl font-semibold">
						<h2
							className={merge(
								"select-none",
								view !== "overview" &&
									"cursor-pointer text-stone-300 underline-offset-8 transition-all duration-100 hover:underline focus-visible:underline focus-visible:outline-none",
							)}
							onClick={() => setView("overview")}
						>
							Overview
						</h2>
						<h2
							className={merge(
								"select-none",
								view !== "deposits" &&
									"cursor-pointer text-stone-300 underline-offset-8 transition-all duration-100 hover:underline focus-visible:underline focus-visible:outline-none",
							)}
							onClick={() => setView("deposits")}
						>
							Deposits
						</h2>
						<h2
							className={merge(
								"select-none",
								view !== "purchases" &&
									"cursor-pointer text-stone-300 underline-offset-8 transition-all duration-100 hover:underline focus-visible:underline focus-visible:outline-none",
							)}
							onClick={() => setView("purchases")}
						>
							Purchases
						</h2>
						<h2
							className={merge(
								"select-none",
								view !== "returns" &&
									"cursor-pointer text-stone-300 underline-offset-8 transition-all duration-100 hover:underline focus-visible:underline focus-visible:outline-none",
							)}
							onClick={() => setView("returns")}
						>
							Returns
						</h2>
					</div>
					<div
						className="hidden h-full w-full overflow-y-auto rounded-lg border shadow-lg xl:flex xl:flex-col"
					>
						<div className="w-full">
							<div className="flex w-full px-4 py-4 border-b border-gray-200 bg-gray-50">
								<div className="flex-1 flex items-left text-left font-semibold text-gray-600 whitespace-nowrap">
									Date
								</div>
								<div className="flex-1 flex justify-center items-center text-left font-semibold text-gray-600">
									Transaction
								</div>
								<div className="flex-1 flex justify-center items-center text-left font-semibold text-gray-600">
									Product
								</div>
								<div className="flex-1 flex justify-start items-center font-semibold text-gray-600">
									<span className="ml-auto mr-10 pr-4">Amount</span>
								</div>
							</div>
							{transactions.length === 0 ? (
							<p className="col-span-4 text-center text-stone-500 py-4">
								No transactions yet
							</p>
							) : (
							transactions.map((transaction) => (
								<div>
								{isPurchase(transaction) && !transaction.isReturnAction && (
									<PurchaseRow key={`purchase-${transaction.purchaseId}`} purchase={transaction} isAdmin={false} />
								)}
								{isPurchase(transaction) && transaction.isReturnAction && (
									<ReturnedRow key={`return-${transaction.purchaseId}`} purchase={transaction} isAdmin={false} />
								)}
								{isDeposit(transaction) && (
									<DepositRow key={`deposit-${transaction.depositId}`} deposit={transaction} />
								)}
								</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
