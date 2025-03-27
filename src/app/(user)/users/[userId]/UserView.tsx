"use client";

import { useToast } from "@/components/ui/use-toast";
import { formatDateTime } from "@/lib/dateUtils";
import { currencyFormatter } from "@/lib/moneyFormatter";
import { merge } from "@/lib/utils";
import { Deposit, Purchase } from "@/server/requests/historyRequests";
import { changePasswordForUser } from "@/server/requests/userRequests";
import { Copy, Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
}: {
	user: UserType;
	depositHistory: Omit<Deposit, "user">[];
	purchaseHistory: Omit<Purchase, "user">[];
}) => {
	const { toast } = useToast();

	const [currentUsername, setCurrentUsername] = useState<string>("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [view, setView] = useState<"combined" | "deposits" | "purchases">(
		"combined",
	);
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	const transactions = useMemo(() => {
		if (view === "combined") {
			return [...depositHistory, ...purchaseHistory].toSorted(
				(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
			);
		}
		return view === "deposits" ? depositHistory : purchaseHistory;
	}, [depositHistory, purchaseHistory, view]);

	const isDeposit = (
		transaction: Partial<Deposit> | Partial<Purchase>,
	): transaction is Deposit => {
		return "amount" in transaction;
	};

	const isPurchase = (
		transaction: Partial<Deposit> | Partial<Purchase>,
	): transaction is Purchase => {
		return "price" in transaction;
	};

	const handlePasswordChange = async () => {
		if (password !== confirmPassword) {
			toast({ title: "Passwords do not match", duration: 2000 });
			return;
		}
		if (!password.trim()) {
			toast({ title: "Password cannot be empty", duration: 2000 });
			return;
		}
		try {
			await changePasswordForUser(user.userId, password);
			toast({ title: "User's password changed successfully", duration: 2000 });
			setPassword("");
			setConfirmPassword("");
			setIsPasswordModalOpen(false);
		} catch (error) {
			console.error("Error changing user password:", error);
			toast({ title: "Failed to update user password", duration: 2000 });
		}
	};

	const handleCancel = (type: "password") => {
		if (type === "password") {
			setPassword("");
			setConfirmPassword("");
			setIsPasswordModalOpen(false);
		}
	};

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
								{user.fullName}
							</h1>
							<p className="text-stone-500">{user.username}</p>
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
						<label htmlFor="balance" className="text-sm text-stone-700">
							Total spent
						</label>
						<p id="total-spent">
							{currencyFormatter.format(
								purchaseHistory.reduce((acc, purchase) => {
									if (purchase.price <= 0) return acc;
									return acc + purchase.price;
								}, 0) / 100,
							)}
						</p>
					</div>
					<div className="flex flex-col">
						<button
							onClick={() => setIsPasswordModalOpen(true)}
							className="mt-2 px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-400 hover:text-black hover:bg-gray-100 flex items-center justify-between w-full transition-colors duration-200"
						>
							<span>Change password</span>
							<Lock width={20} height={20} />
						</button>
					</div>
				</div>
				<div className="flex h-full w-full flex-col overflow-clip px-4 space-y-2">
					<div className="mb-2 flex gap-4 text-xl font-semibold">
						<h2
							className={merge(
								"select-none",
								view !== "combined" &&
									"cursor-pointer text-stone-300 underline-offset-8 transition-all duration-100 hover:underline focus-visible:underline focus-visible:outline-none",
							)}
							onClick={() => setView("combined")}
						>
							Combined
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
					</div>
					<div
						className={merge(
							"grid h-full auto-rows-max gap-x-4 gap-y-1 overflow-y-scroll pr-4",
							view === "deposits" || view === "combined"
								? "grid-cols-[max-content_max-content_auto_max-content_max-content]"
								: "grid-cols-[max-content_max-content_auto_max-content_max-content]",
						)}
					>
						{transactions.length === 0 ? (
							<p className="col-span-5 text-center text-stone-500 py-4">
								No transactions yet
							</p>
						) : (
							transactions.map((transaction, index) => (
								<div key={index} className="contents">
									<p className="text-right">
										{formatDateTime(new Date(transaction.time))}
									</p>
									{isPurchase(transaction) && transaction.price > 0 && (
										<>
											<p>Purchase</p>
											<p>{transaction.product?.name ?? "Unknown Product"}</p>
											<p className="font-mono text-red-600">-</p>
											<p className="text-right font-mono text-red-600">
												{currencyFormatter.format(transaction.price / 100)}
											</p>
										</>
									)}
									{isPurchase(transaction) && transaction.price <= 0 && (
										<>
											<p>Returned</p>
											<p>{transaction.product?.name ?? "Unknown Product"}</p>
											<p className="font-mono text-green-700">+</p>
											<p className="text-right font-mono text-green-700">
												{currencyFormatter.format(
													Math.abs(transaction.price) / 100,
												)}
											</p>
										</>
									)}
									{isDeposit(transaction) && (
										<>
											<p>Deposit</p>
											<p></p>
											<p className="font-mono text-green-700">+</p>
											<p className="text-right font-mono text-green-700">
												{currencyFormatter.format(transaction.amount / 100)}
											</p>
										</>
									)}
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{isPasswordModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
						<h2 className="text-xl font-semibold mb-4">Change password</h2>
						<div className="flex justify-between items-center mb-4">
							<p className="text-xs text-stone-700 ml-auto">
								Mandatory fields*
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<label htmlFor="password" className="text-xs text-stone-700">
								New password*
							</label>
							<div className="relative">
								<input
									type={isPasswordVisible ? "text" : "password"}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="px-2 py-1 border rounded text-sm w-full"
								/>
								<button
									type="button"
									onClick={() => setIsPasswordVisible(!isPasswordVisible)}
									className="absolute right-2 top-1/2 transform -translate-y-1/2"
								>
									{isPasswordVisible ? (
										<EyeOff width={20} height={20} />
									) : (
										<Eye width={20} height={20} />
									)}
								</button>
							</div>
							<label
								htmlFor="confirmPassword"
								className="text-xs text-stone-700"
							>
								Confirm password*
							</label>
							<div className="relative">
								<input
									type={isConfirmPasswordVisible ? "text" : "password"}
									id="confirmPassword"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="px-2 py-1 border rounded text-sm w-full"
								/>
								<button
									type="button"
									onClick={() =>
										setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
									}
									className="absolute right-2 top-1/2 transform -translate-y-1/2"
								>
									{isConfirmPasswordVisible ? (
										<EyeOff width={20} height={20} />
									) : (
										<Eye width={20} height={20} />
									)}
								</button>
							</div>
						</div>
						<div className="flex gap-2 justify-center mt-4">
							<button
								onClick={handlePasswordChange}
								className="px-3 py-1.5 bg-white text-black border border-black rounded hover:bg-black hover:text-white transition-colors duration-200 text-sm"
							>
								Update
							</button>
							<button
								onClick={() => handleCancel("password")}
								className="px-3 py-1.5 bg-white text-black border border-black rounded hover:bg-black hover:text-white transition-colors duration-200 text-sm"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
