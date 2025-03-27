"use client";

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
import { formatDateTime } from "@/lib/dateUtils";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
	const router = useRouter();
	const [currentUsername, setCurrentUsername] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState(user.role);
	const [newRole, setNewRole] = useState<UserRole | "">("");
	const [view, setView] = useState<"combined" | "deposits" | "purchases">(
		"combined",
	);
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
			console.log("Detected username from UI:", username);
			setCurrentUsername(username);
		} else {
			console.log(
				"No 'Logged in as' element found, using fallback: admin_user",
			);
			setCurrentUsername("admin_user");
		}
	}, []);

	const isCurrentUser = currentUsername === user.username;
	console.log("isCurrentUser:", isCurrentUser, {
		currentUsername,
		userUsername: user.username,
	});

	const transactions = useMemo(() => {
		if (view === "combined") {
			return [...depositHistory, ...purchaseHistory].toSorted(
				(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
			);
		}
		return view === "deposits" ? depositHistory : purchaseHistory;
	}, [depositHistory, purchaseHistory, view]);

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
		console.log("handleRoleChange called", { newRole, role, isCurrentUser });
		if (isCurrentUser) {
			setIsRoleConfirmOpen(true);
		} else {
			performRoleChange();
		}
	};

	const performRoleChange = async () => {
		console.log("performRoleChange called", {
			userId: user.userId,
			newRole,
			isCurrentUser,
		});
		try {
			await changeUserRole(user.userId, newRole as UserRole);
			setRole(newRole as UserRole);
			toast({ title: "User role updated successfully", duration: 2000 });

			if (isCurrentUser) {
				console.log("Current user changed their own role, logging out...");
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
						{transactions.map((transaction) => (
							<>
								<p className="text-right">
									{formatDateTime(new Date(transaction.time))}
								</p>
								{isPurchase(transaction) && transaction.price > 0 && (
									<>
										<p>Purchase</p>
										<Link
											href={`/admin/products/${transaction.product.barcode}`}
										>
											{transaction.product.name}
										</Link>
										<p className="font-mono text-red-600">-</p>
										<p className="text-right font-mono text-red-600">
											{currencyFormatter.format(transaction.price / 100)}
										</p>
									</>
								)}
								{isPurchase(transaction) && transaction.price <= 0 && (
									<>
										<p>Returned</p>
										<Link
											href={`/admin/products/${transaction.product.barcode}`}
										>
											{transaction.product.name}
										</Link>
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
										<p></p> <p className="font-mono text-green-700">+</p>
										<p className="text-right font-mono text-green-700">
											{currencyFormatter.format(transaction.amount / 100)}
										</p>
									</>
								)}
							</>
						))}
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
