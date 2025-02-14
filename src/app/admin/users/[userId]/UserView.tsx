"use client";

import { useToast } from "@/components/ui/use-toast";
import { currencyFormatter } from "@/lib/moneyFormatter";
import { isDeposit, isPurchase } from "@/lib/transactions";
import { merge } from "@/lib/utils";
import { Deposit, Purchase } from "@/server/requests/historyRequests";
import { User, changeUserRole } from "@/server/requests/userRequests";
import { Copy } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { UserRole } from "@/server/requests/types";

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
  const [view, setView] = useState<"combined" | "deposits" | "purchases">(
    "combined",
  );
  const transactions = useMemo(() => {
    if (view === "combined") {
      return [...depositHistory, ...purchaseHistory].toSorted(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
      );
    }

    return view === "deposits" ? depositHistory : purchaseHistory;
  }, [depositHistory, purchaseHistory, view]);

  //En saanut reloadia tehtyä ilamn että joku menee rikki
  const handleRoleChange = async () => {
    try {
      await changeUserRole(user.userId, UserRole.ADMIN);
      toast({ title: "User role updated to admin", duration: 2000 });
    } catch (error) {
      console.error('Error changing user role:', error);
      toast({ title: "Failed to update user role", duration: 2000 });
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
            <p id="role">{user.role}</p>
            {user.role !== UserRole.ADMIN && (
              <button
                onClick={handleRoleChange}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Make Admin
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
