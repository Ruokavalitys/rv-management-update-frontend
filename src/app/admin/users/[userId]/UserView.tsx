"use client";

import { DepositRow } from "@/components/UserHistoryTable/UserDepositRow";
import { PurchaseRow } from "@/components/UserHistoryTable/UserPurchaseRow";
import { ReturnedRow } from "@/components/UserHistoryTable/UserReturnedRow";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { currencyFormatter } from "@/lib/moneyFormatter";
import { isDeposit, isPurchase } from "@/lib/transactions";
import { merge } from "@/lib/utils";
import { Deposit, Purchase } from "@/server/requests/historyRequests";
import { UserRole } from "@/server/requests/types";
import {
	User as UserType,
	changePassword,
	changeUserRole,
} from "@/server/requests/userRequests";
import { Copy, Eye, EyeOff, Lock } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
	const router = useRouter();
	const [currentUsername, setCurrentUsername] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState(user.role);
	const [newRole, setNewRole] = useState<UserRole | "">("");
	const [view, setView] = useState<
		"overview" | "deposits" | "purchases" | "returns"
	>("overview");
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);
	const [isRoleConfirmOpen, setIsRoleConfirmOpen] = useState(false);

	useEffect(() => {
		const loggedInAsElement = document.querySelector(
			"p.text-xs.text-stone-600",
		);
		if (loggedInAsElement) {
			const usernameMatch =
				loggedInAsElement.textContent?.match(/Logged in as\s+(.+)/);
			const username = usernameMatch ? usernameMatch[1].trim() : null;
			setCurrentUsername(username);
		} else {
			setCurrentUsername("admin_user");
		}
	}, []);

	const isCurrentUser = currentUsername === user.username;
	const transactions = useMemo(() => {
		if (view === "overview") {
			return [...depositHistory, ...purchaseHistory, ...returnHistory].toSorted(
				(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
			);
		}
		if (view === "deposits") {
			return depositHistory;
		}
		if (view === "purchases") {
			return purchaseHistory;
		}
		if (view === "returns") {
			return returnHistory;
		}
		return [];
	}, [depositHistory, purchaseHistory, returnHistory, view]);

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
			await changePassword(user.userId, password);
			toast({ title: "User's password changed successfully", duration: 2000 });
			setPassword("");
			setConfirmPassword("");
			setIsPasswordModalOpen(false);
		} catch (error) {
			console.error("Error changing user password:", error);
			toast({ title: "Failed to update user password", duration: 2000 });
		}
	};

	const handleRoleChange = () => {
		if (!newRole || newRole === role) {
			setIsRoleModalOpen(false);
			return;
		}
		if (isCurrentUser) {
			setIsRoleConfirmOpen(true);
		} else {
			performRoleChange();
		}
	};

	const performRoleChange = async () => {
		try {
			await changeUserRole(user.userId, newRole as UserRole);
			setRole(newRole as UserRole);
			toast({ title: "User role updated successfully", duration: 2000 });

			if (isCurrentUser) {
				await signOut({ redirectTo: "/" });
			} else {
				setIsRoleModalOpen(false);
				setIsRoleConfirmOpen(false);
				router.refresh();
			}
		} catch (error) {
			console.error("Error changing user role:", error);
			toast({ title: "Failed to update user role", duration: 2000 });
			setIsRoleConfirmOpen(false);
		}
	};

	const handleCancel = (type: "password" | "role") => {
		if (type === "password") {
			setPassword("");
			setConfirmPassword("");
			setIsPasswordModalOpen(false);
		} else {
			setNewRole("");
			setIsRoleModalOpen(false);
			setIsRoleConfirmOpen(false);
		}
	};

	const openRoleModal = () => {
		setNewRole("");
		setIsRoleModalOpen(true);
	};

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
						<div className="flex justify-between items-center">
							<label htmlFor="role" className="text-sm text-stone-700">
								Role
							</label>
							<span
								onClick={openRoleModal}
								className="text-xs text-gray-400 cursor-pointer hover:text-black hover:underline"
							>
								Change role
							</span>
						</div>
						<p id="role">{role}</p>
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
									if (purchase.price <= 0 || purchase.returned) return acc;
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
					<div className="hidden h-full w-full overflow-y-auto rounded-lg border shadow-lg xl:flex xl:flex-col">
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
								<div className="flex-1 flex justify-center items-center text-left font-semibold text-gray-600">
									<span className="ml-auto mr-10 pr-4">Amount</span>
								</div>
							</div>
							{transactions.length === 0 ? (
								<p className="col-span-4 text-center text-stone-500 py-4">
									No transactions yet
								</p>
							) : (
								transactions.map((transaction, index) => (
									<div key={index}>
										{isPurchase(transaction) && !transaction.isReturnAction && (
											<PurchaseRow
												key={`purchase-${transaction.purchaseId}`}
												purchase={transaction}
												isAdmin={true}
											/>
										)}
										{isPurchase(transaction) && transaction.isReturnAction && (
											<ReturnedRow
												key={`return-${transaction.purchaseId}`}
												purchase={transaction}
												isAdmin={true}
											/>
										)}
										{isDeposit(transaction) && (
											<DepositRow
												key={`deposit-${transaction.depositId}`}
												deposit={transaction}
											/>
										)}
									</div>
								))
							)}
						</div>
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

			{isRoleModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
						<h2 className="text-xl font-semibold mb-4">Change role</h2>
						<div className="flex flex-col gap-2">
							<label htmlFor="role" className="text-xs text-stone-700"></label>
							<select
								id="role"
								value={newRole}
								onChange={(e) => {
									const selectedRole = e.target.value as UserRole;
									setNewRole(selectedRole);
								}}
								className="px-2 py-1 border rounded text-sm w-full"
							>
								<option value="" disabled>
									Select a role
								</option>
								{role !== UserRole.ADMIN && (
									<option value={UserRole.ADMIN}>ADMIN</option>
								)}
								{role !== UserRole.USER1 && (
									<option value={UserRole.USER1}>USER1</option>
								)}
								{role !== UserRole.USER2 && (
									<option value={UserRole.USER2}>USER2</option>
								)}
								{role !== UserRole.INACTIVE && (
									<option value={UserRole.INACTIVE}>INACTIVE</option>
								)}
							</select>
						</div>
						<div className="flex gap-2 justify-center mt-4">
							<button
								onClick={handleRoleChange}
								className="px-3 py-1.5 bg-white text-black border border-black rounded hover:bg-black hover:text-white transition-colors duration-200 text-sm"
							>
								Update
							</button>
							<button
								onClick={() => handleCancel("role")}
								className="px-3 py-1.5 bg-white text-black border border-black rounded hover:bg-black hover:text-white transition-colors duration-200 text-sm"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			<AlertDialog open={isRoleConfirmOpen} onOpenChange={setIsRoleConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to change your role to{" "}
							<strong>{newRole}</strong>? This will log you out as the site
							requires ADMIN role for access.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setIsRoleConfirmOpen(false)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={performRoleChange}
							className="bg-blue-600 text-white hover:bg-blue-700"
						>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
