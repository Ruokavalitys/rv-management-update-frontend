"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { usePartialSetAtom } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import Link from "next/link";
import { productFiltersAtom } from "./ProductTable";

export default function ProductFilters() {
  const setFilters = usePartialSetAtom(productFiltersAtom);
  const resetFilters = useResetAtom(productFiltersAtom);
  const filters = useAtomValue(productFiltersAtom);

  const setExclusiveFilter = (filterKey: string) => {
    setFilters({
      quantityLessThan10: false,
      quantityBetween10And50: false,
      quantityGreaterThan50: false,
      [filterKey]: !filters[filterKey as keyof typeof filters],
    });
  };

  const toggleStockFilters = (filterKey: "onlyInStock" | "onlyOutOfStock") => {
    if (filterKey === "onlyInStock") {
      setFilters({ onlyInStock: !filters.onlyInStock, onlyOutOfStock: false });
    } else {
      setFilters({ onlyOutOfStock: !filters.onlyOutOfStock, onlyInStock: false });
    }
  };

  const toggleSortByPrice = (sortOrder: "asc" | "desc") => {
    setFilters({ sortByPrice: filters.sortByPrice === sortOrder ? undefined : sortOrder });
  };

  const toggleSortByQuantity = (sortOrder: "asc" | "desc") => {
    setFilters({ sortByQuantity: filters.sortByQuantity === sortOrder ? undefined : sortOrder });
  };

  return (
    <div className="flex w-1/4 flex-col gap-y-4">
      <Button asChild variant="green" className="w-full">
        <Link href="/admin/new/product">New Product</Link>
      </Button>
      <Button onClick={() => resetFilters()} className="w-full" variant={"outline"}>
        Reset filters
      </Button>
      <label className="-mb-3 text-sm text-stone-500">Filters</label>
      <Input
        value={filters.search}
        placeholder="Search products / boxes"
        onChange={({ target }) => setFilters({ search: target.value })}
      />

      <div className="flex flex-col gap-y-2 rounded-lg border p-4 mt-4">
        <p className="text-stone-500">Sort by price</p>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="low_to_high"
            checked={filters.sortByPrice === "asc"}
            onClick={() => toggleSortByPrice("asc")}
          />
          <label htmlFor="low_to_high" className="cursor-pointer select-none text-sm">
            Low to High
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="high_to_low"
            checked={filters.sortByPrice === "desc"}
            onClick={() => toggleSortByPrice("desc")}
          />
          <label htmlFor="high_to_low" className="cursor-pointer select-none text-sm">
            High to Low
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-y-2 rounded-lg border p-4 mt-4">
        <p className="text-stone-500">Sort by quantity</p>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="low_to_high_quantity"
            checked={filters.sortByQuantity === "asc"}
            onClick={() => toggleSortByQuantity("asc")}
          />
          <label htmlFor="low_to_high_quantity" className="cursor-pointer select-none text-sm">
            Low to High
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="high_to_low_quantity"
            checked={filters.sortByQuantity === "desc"}
            onClick={() => toggleSortByQuantity("desc")}
          />
          <label htmlFor="high_to_low_quantity" className="cursor-pointer select-none text-sm">
            High to Low
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-y-2 rounded-lg border p-4 mt-4">
        <p className="text-stone-500">Filter by quantity</p>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="quantity_less_than_10"
            checked={filters.quantityLessThan10}
            onClick={() => setExclusiveFilter("quantityLessThan10")}
          />
          <label htmlFor="quantity_less_than_10" className="cursor-pointer select-none text-sm">
            {"<"} 10
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="quantity_between_10_and_50"
            checked={filters.quantityBetween10And50}
            onClick={() => setExclusiveFilter("quantityBetween10And50")}
          />
          <label htmlFor="quantity_between_10_and_50" className="cursor-pointer select-none text-sm">
            10 - 50
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="quantity_greater_than_50"
            checked={filters.quantityGreaterThan50}
            onClick={() => setExclusiveFilter("quantityGreaterThan50")}
          />
          <label htmlFor="quantity_greater_than_50" className="cursor-pointer select-none text-sm">
            {">"} 50
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-y-2 rounded-lg border p-4 mt-4">
        <p className="text-stone-500">Show products by stock</p>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="in_stock_only"
            checked={filters.onlyInStock}
            onClick={() => toggleStockFilters("onlyInStock")}
          />
          <label htmlFor="in_stock_only" className="cursor-pointer select-none text-sm">
            Show in stock only
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="out_of_stock_only"
            checked={filters.onlyOutOfStock}
            onClick={() => toggleStockFilters("onlyOutOfStock")}
          />
          <label htmlFor="out_of_stock_only" className="cursor-pointer select-none text-sm">
            Show out of stock only
          </label>
        </div>
      </div>
    </div>
  );
}