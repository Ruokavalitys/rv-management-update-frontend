"use client";
 
import { useToast } from "@/components/ui/use-toast";
import { currencyFormatter } from "@/lib/moneyFormatter";
import { isDeposit, isPurchase } from "@/lib/transactions";
import { merge } from "@/lib/utils";
import { Deposit, Purchase } from "@/server/requests/historyRequests";
import { UserRole } from "@/server/requests/types";
import { User, changePassword, changeUserRole } from "@/server/requests/userRequests";
import { Copy } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
 
export const UserView = ({
  user,
  depositHistory,
  purchaseHistory,
}: {
  user: User;
  depositHistory: Omit<Deposit, "user">[];
  purchaseHistory: Omit<Purchase, "user">[];
}) => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [role, setRole] = useState(user.role);
  const [view, setView] = useState<"combined" | "deposits" | "purchases">("combined");
 
  const transactions = useMemo(() => {
    if (view === "combined") {
      return [...depositHistory, ...purchaseHistory].toSorted(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
      );
    }
 
    return view === "deposits" ? depositHistory : purchaseHistory;
  }, [depositHistory, purchaseHistory, view]);
 
  const handleRoleChange = async () => {
    try {
      const newRole = role === UserRole.ADMIN ? UserRole.USER1 : UserRole.ADMIN;
      await changeUserRole(user.userId, newRole);
      setRole(newRole);
      window.location.reload();
    } catch (error) {
      console.error("Error changing user role:", error);
      toast({ title: "Failed to update user role", duration: 2000 });
    }
    toast({
      title: `User role updated succesfully`,
      duration: 2000,
    });
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
      await changePassword(user.userId, password);
      toast({ title: "User's password changed successfully", duration: 2000 });
      setPassword("");
      setConfirmPassword("");
      setIsPasswordChanging(false);
    } catch (error) {
      console.error("Error changing user password:", error);
      toast({ title: "Failed to update user password", duration: 2000 });
    }
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
            <label htmlFor="email" className="text-sm text-stone-500">
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
            <label htmlFor="role" className="text-sm text-stone-500">
              Role
            </label>
            <p id="role">{role}</p>
            {user.role !== UserRole.ADMIN && (
              <button
                onClick={handleRoleChange}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Make into Admin
              </button>
            )}
            {user.role === UserRole.ADMIN && (
              <button
                onClick={handleRoleChange}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Make into User1
              </button>
            )}
          </div>
 
          <div className="flex flex-col">
            <label htmlFor="balance" className="text-sm text-stone-500">
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
            <label htmlFor="balance" className="text-sm text-stone-500">
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
              onClick={() => setIsPasswordChanging(!isPasswordChanging)}
              className="mt-2 px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition-colors duration-200"
            >
              Change Password
            </button>
            {isPasswordChanging && (
              <div className="mt-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm text-stone-500"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                    placeholder="New password"
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm text-stone-500"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                    placeholder="Confirm password"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handlePasswordChange}
                      className="px-4 py-2 bg-white text-black border border-black rounded hover:bg-black hover:text-white transition-colors duration-200"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setPassword("");
                        setConfirmPassword("");
                        setIsPasswordChanging(false);
                      }}
                      className="px-4 py-2 bg-white text-black border border-black rounded hover:bg-black hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
 
        <div className="flex h-full w-full flex-col overflow-clip px-4">
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
              view === "deposits"
                ? "grid-cols-[max-content_max-content_min-content_max-content_max-content]"
                : "grid-cols-[max-content_max-content_auto_max-content_max-content]",
            )}
          >
            {transactions.map((transaction) => (
              <>
                <p className="text-right">
                  {new Date(transaction.time).toLocaleDateString("fi-FI")}
                </p>
                {isPurchase(transaction) && transaction.price > 0 && (
                  <>
                    <p>Bought</p>
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
                    <p>Deposited</p>
                    <p></p>
                    <p className="font-mono text-green-700">+</p>
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
    </div>
  );
};