"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currencyFormatter } from "@/lib/moneyFormatter";
import { merge } from "@/lib/utils";
import { Purchase } from "@/server/requests/historyRequests";
import { Product } from "@/server/requests/productRequests";
import {
  BadgeEuro,
  ChevronDown,
  ChevronsDown,
  Clock,
  Euro,
  RotateCcw,
  ShoppingBasket,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";

const numberFormatter = Intl.NumberFormat("fi-FI");

const formatDateTime = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateOnly = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

const parsePurchaseDate = (time: string | number): Date | null => {
  let date = new Date(time);
  if (!isNaN(date.getTime())) return date;

  if (typeof time === "string") {
    let parts = time.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s(\d{2}):(\d{2}):(\d{2}))?$/);
    if (parts) {
      const [_, day, month, year, hours = "00", minutes = "00", seconds = "00"] = parts;
      date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`);
      if (!isNaN(date.getTime())) return date;
    }

    parts = time.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (parts) {
      date = new Date(`${parts[1]}-${parts[2]}-${parts[3]}T00:00:00Z`);
      if (!isNaN(date.getTime())) return date;
    }
  }
  return null;
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 1) + "…";
};

const rangeOptions = {
  week: "Last week",
  month: "Last month",
  year: "Last year",
  all: "All time",
  custom: "Custom",
};

const cutoffs: Record<keyof typeof rangeOptions, Date> = {
  week: getDateOnly(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
  month: getDateOnly(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  year: getDateOnly(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)),
  all: new Date(0),
  custom: new Date(0),
};

export default function Dashboard({
  products,
  purchases,
}: {
  products: Product[];
  purchases: Purchase[];
}) {
  const [dateRange, setDateRange] = useState<keyof typeof rangeOptions>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const rangeText = dateRange === "custom" ? "Custom" : rangeOptions[dateRange];

  const filteredPurchases = useMemo(() => {
    if (dateRange === "all") return purchases;

    if (dateRange === "custom") {
      let result = purchases;
      const today = getDateOnly(new Date());

      if (customStartDate) {
        const start = new Date(customStartDate);
        if (isNaN(start.getTime()) || getDateOnly(start) > today) {
          return purchases;
        }
        result = result.filter((purchase) => {
          const purchaseDate = parsePurchaseDate(purchase.time);
          return purchaseDate && purchaseDate >= start;
        });
      }
      if (customEndDate) {
        const end = new Date(customEndDate);
        if (isNaN(end.getTime()) || getDateOnly(end) > today) {
          return purchases;
        }
        end.setHours(23, 59, 59, 999);
        if (customStartDate && new Date(customStartDate) > end) {
          return purchases;
        }
        result = result.filter((purchase) => {
          const purchaseDate = parsePurchaseDate(purchase.time);
          return purchaseDate && purchaseDate <= end;
        });
      }
      return result;
    }
    return purchases.filter((purchase) => {
      const purchaseDate = parsePurchaseDate(purchase.time);
      return purchaseDate && purchaseDate >= cutoffs[dateRange];
    });
  }, [dateRange, customStartDate, customEndDate, purchases]);

  const nonReturnedPurchases = useMemo(() => {
    return filteredPurchases.filter((purchase) => {
      if (typeof purchase.returned !== "boolean") return false;
      if (!Number.isFinite(purchase.price) || purchase.price < 0) return false;
      return !purchase.returned;
    });
  }, [filteredPurchases]);

  const totalStockValue = useMemo(() => {
    return (
      products.reduce((acc, product) => {
        const stockValue =
          Math.max(product.stock, 0) * Math.min(product.buyPrice, product.sellPrice);
        return acc + stockValue;
      }, 0) / 100
    );
  }, [products]);

  const totalSalesValue = useMemo(() => {
    return nonReturnedPurchases.reduce((acc, purchase) => acc + (purchase.price || 0), 0) / 100;
  }, [nonReturnedPurchases]);

  const averageSaleValue = useMemo(() => {
    if (nonReturnedPurchases.length === 0) return 0;
    const total = nonReturnedPurchases.reduce((acc, purchase) => acc + (purchase.price || 0), 0) / 100;
    return total / nonReturnedPurchases.length;
  }, [nonReturnedPurchases]);

  const totalTransactions = useMemo(() => {
    return nonReturnedPurchases.length;
  }, [nonReturnedPurchases]);

  const lowestStockProducts = useMemo(() => {
    return products
      .filter((product) => product.stock > 0)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 20);
  }, [products]);

  const groupedProductSales = useMemo(() => {
    return filteredPurchases.reduce((acc, purchase) => {
      const product = purchase.product;
      if (purchase.price <= 0) return acc;
      acc.set(product.barcode, (acc.get(product.barcode) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());
  }, [filteredPurchases]);

  const mostSoldProducts = useMemo(() => {
    return Array.from(groupedProductSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [groupedProductSales]);

  const allLatestTransactions = useMemo(() => {
    return [...purchases]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 20);
  }, [purchases]);

  const handleResetDates = () => {
    setCustomStartDate("");
    setCustomEndDate("");
  };

  return (
    <div
      className="flex h-full w-full flex-col gap-y-4 p-6 pl-0 overflow-y-auto"
      style={{ scrollbarGutter: "stable" }}
    >
      <h1 className="flex items-center gap-4 text-3xl font-semibold">
        Dashboard
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-max items-center gap-2 text-xl text-stone-600">
              <ChevronDown />
              {rangeText}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(rangeOptions).map(([key, value]) => {
                const selected = dateRange === key;
                return (
                  <DropdownMenuItem
                    key={key}
                    className={merge(selected ? "bg-stone-100 font-semibold" : "cursor-pointer")}
                    onClick={() => {
                      setDateRange(key as keyof typeof rangeOptions);
                      if (key !== "custom") {
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }
                    }}
                  >
                    {value}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="w-64">
            {dateRange === "custom" ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={getTodayDate()}
                    className="w-full rounded border border-stone-300 py-1 px-2 text-sm font-normal"
                    aria-label="Custom start date"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    max={getTodayDate()}
                    className="w-full rounded border border-stone-300 py-1 px-2 text-sm font-normal"
                    aria-label="Custom end date"
                  />
                  <button
                    onClick={handleResetDates}
                    className="p-1 text-stone-600 hover:text-stone-800 transition-colors"
                    aria-label="Reset custom date range"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <div className="min-h-[20px]">
                    {customStartDate && customEndDate && (
                      (getDateOnly(new Date(customStartDate)) > getDateOnly(new Date()) ||
                        getDateOnly(new Date(customEndDate)) > getDateOnly(new Date())) ? (
                        <span className="text-red-500 text-sm whitespace-nowrap">
                          Dates cannot be in the future.
                        </span>
                      ) : new Date(customStartDate) > new Date(customEndDate) ? (
                        <span className="text-red-500 text-sm whitespace-nowrap">
                          Start date must be before end date.
                        </span>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-8" />
            )}
          </div>
        </div>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="grid auto-rows-max grid-cols-subgrid gap-4">
          <Card className="h-max">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeEuro /> Stock value
              </CardTitle>
              <CardDescription>Σ stock * min(sellPrice, buyPrice)</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <span className="text-3xl">{currencyFormatter.format(totalStockValue)}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChevronsDown /> Low stock
              </CardTitle>
              <CardDescription>Bottom 20 items by stock quantity > 0</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-[max-content_max-content] items-center gap-x-2">
              {lowestStockProducts.map((product) => (
                <Fragment key={product.barcode}>
                  <span className="text-right text-sm text-stone-500 dark:text-stone-400">
                    {numberFormatter.format(product.stock)}
                  </span>
                  <Link
                    href={`/admin/products/${product.barcode}`}
                    className="hover:underline text-stone-900 dark:text-stone-100 overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {truncateText(product.name, 45)}
                  </Link>
                </Fragment>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-subgrid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBasket /> Most sold products
              </CardTitle>
              <CardDescription>Top 10 products by sales ({rangeText})</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-[max-content_max-content] items-center gap-x-2">
              {mostSoldProducts.length > 0 ? (
                mostSoldProducts.map(([barcode, count]) => {
                  const product = products.find((p) => p.barcode === barcode);
                  return (
                    <Fragment key={barcode}>
                      <span className="text-right text-sm text-stone-500 dark:text-stone-400">
                        {numberFormatter.format(count)}
                      </span>
                      <Link
                        href={`/admin/products/${barcode}`}
                        className="hover:underline text-stone-900 dark:text-stone-100"
                      >
                        {product?.name || "Unknown Product"}
                      </Link>
                    </Fragment>
                  );
                })
              ) : (
                <span className="col-span-2 text-stone-500">No sales data available for this period.</span>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-subgrid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock /> Latest transactions
              </CardTitle>
              <CardDescription>Latest 20 sales and returns</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-[max-content_200px_1fr] items-center gap-x-2">
              {allLatestTransactions.length > 0 ? (
                allLatestTransactions.map((purchase, index) => {
                  const product = products.find((p) => p.barcode === purchase.product.barcode);
                  if (!product) return null;
                  return (
                    <Fragment key={purchase.purchaseId || `transaction-${index}`}>
                      <span className="text-right text-sm text-stone-500 dark:text-stone-400">
                        {purchase.returned ? "Returned" : "Sold"}
                      </span>
                      <Link
                        href={`/admin/products/${product.barcode}`}
                        className="overflow-hidden text-ellipsis whitespace-nowrap hover:underline text-stone-900 dark:text-stone-100"
                      >
                        {truncateText(product.name, 30)}
                      </Link>
                      <span className="text-sm text-stone-500 dark:text-stone-400 justify-self-end">
                        {formatDateTime(new Date(purchase.time))}
                      </span>
                    </Fragment>
                  );
                })
              ) : (
                <span className="col-span-3 text-stone-500">No transactions available for this period.</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="grid grid-cols-subgrid gap-4">
          <Card className="h-max">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro /> Total sales value
              </CardTitle>
              <CardDescription>Revenue from sales ({rangeText})</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <span className="text-3xl">{currencyFormatter.format(totalSalesValue)}</span>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-subgrid gap-4">
          <Card className="h-max">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp /> Average sale value
              </CardTitle>
              <CardDescription>Σ price where returned = false / count ({rangeText})</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <span className="text-3xl">{currencyFormatter.format(averageSaleValue)}</span>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-subgrid gap-4">
          <Card className="h-max">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart /> Total transactions
              </CardTitle>
              <CardDescription>Count where returned = false ({rangeText})</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <span className="text-3xl">{numberFormatter.format(totalTransactions)}</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}