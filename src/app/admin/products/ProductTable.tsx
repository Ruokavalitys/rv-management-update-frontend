"use client";

import { currencyFormatter } from "@/lib/moneyFormatter";
import { Product } from "@/server/requests/productRequests";
import { useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const productFiltersAtom = atomWithReset({
  search: "",
  onlyInStock: false,
  onlyOutOfStock: false,
  quantityLessThan10: false,
  quantityBetween10And50: false,
  quantityGreaterThan50: false,
  sortByPrice: "",
  sortByQuantity: "",
});

function ProductTable({ products }: { products: Product[] }) {
  const filters = useAtomValue(productFiltersAtom);

  const filteredProducts = products
    .filter((product) => {
      if (filters.search) {
        return (
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.barcode.includes(filters.search)
        );
      }
      return true;
    })
    .filter((product) => {
      if (filters.onlyInStock) return product.stock > 0;
      if (filters.onlyOutOfStock) return product.stock <= 0;
      return true;
    })
    .filter((product) => {
      if (filters.quantityLessThan10) return product.stock < 10;
      if (filters.quantityBetween10And50) return product.stock >= 10 && product.stock <= 50;
      if (filters.quantityGreaterThan50) return product.stock > 50;
      return true;
    });

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (filters.sortByPrice === "asc") return a.sellPrice - b.sellPrice;
    if (filters.sortByPrice === "desc") return b.sellPrice - a.sellPrice;
    if (filters.sortByQuantity === "asc") return a.stock - b.stock;
    if (filters.sortByQuantity === "desc") return b.stock - a.stock;
    if (filters.sortByPrice === "asc") return a.sellPrice - b.sellPrice;
    if (filters.sortByPrice === "desc") return b.sellPrice - a.sellPrice;
    return new Intl.Collator("fi", { sensitivity: "base" }).compare(a.name, b.name);
  });

  const path = usePathname();

  return (
    <div
      className={`${/\/products\/\d+/g.test(path) ? "hidden w-3/5 xl:flex" : "flex w-full"} h-full overflow-y-auto rounded-lg border shadow-lg`}
    >
      <div className="w-full">
        {sortedProducts.length === 0 && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-stone-500">No products found</p>
          </div>
        )}
        {sortedProducts.map((product) => (
          <Link tabIndex={-1} href={`/admin/products/${product.barcode}`} key={product.barcode}>
            <div className="flex cursor-pointer justify-between border-b border-gray-200 px-4 py-3 transition-all hover:bg-stone-100">
              <div className="flex min-h-full w-1/3 flex-col justify-between whitespace-nowrap">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-stone-500">{product.barcode}</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-lg text-stone-500">
                  <span className={`font-semibold ${product.stock < 0 ? "text-red-500" : "text-black"}`}>
                    {product.stock}
                  </span>{" "}
                  pcs
                </p>
                <p className="text-lg text-stone-500">
                  {currencyFormatter.format(product.buyPrice / 100)} →{" "}
                  <span className="font-semibold text-black">
                    {currencyFormatter.format(product.sellPrice / 100)}
                  </span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProductTable;
