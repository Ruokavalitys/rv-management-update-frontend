"use client";

import Barcode from "@/components/Barcode";
import Label from "@/components/WithLabel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { currencyFormatter } from "@/lib/moneyFormatter";
import { Box } from "@/server/requests/boxRequests";
import { Product } from "@/server/requests/productRequests";
import Link from "next/link";
import AttachedBoxesList from "./AttachedBoxesList";

type OwnProps = { product: Product; boxes: Box[] };

export const ProductView = ({ product, boxes }: OwnProps) => {
  const { toast } = useToast();

  return (
    <div className="flex h-full w-full flex-col justify-between gap-y-4">
      <div className="flex h-full min-h-0 w-full flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="flex justify-between">
          <div className="flex w-full flex-col gap-y-4">
            <div className="flex gap-x-8">
              <Label label="Stock">
                <p
                  id="stock"
                  className={product.stock < 0 ? "text-red-500" : ""}
                >
                  {product.stock}
                </p>
              </Label>
              <Label label="Buy Price">
                <p id="buyPrice">
                  {currencyFormatter.format(product.buyPrice / 100)}
                </p>
              </Label>
              <Label label="Sell Price">
                <p id="sellPrice">
                  {currencyFormatter.format(product.sellPrice / 100)}
                </p>
              </Label>
            </div>
            <Label label="Category">
              <p id="category">{product.category.description}</p>
            </Label>
          </div>

          <div
            className="flex cursor-pointer flex-col items-center self-center transition-all hover:scale-110"
            onClick={() => {
              navigator.clipboard.writeText(product.barcode);
              toast({ title: "Barcode copied to clipboard", duration: 2000 });
            }}
          >
            <Barcode
              barcode={product.barcode}
              width={3}
              height={80}
              displayInvalid
              background="transparent"
            />
          </div>
        </div>
        <hr />
        <div className="flex h-full min-h-0 gap-x-2">
          <div className="flex h-full w-5/12 min-w-0 flex-col gap-y-2">
            <h3 className="text-lg font-semibold">Attached Boxes</h3>
            <AttachedBoxesList boxes={boxes} barcode={product.barcode} />
          </div>
          <div className="flex h-full w-7/12 min-w-0 flex-col justify-between gap-y-4 pb-8">
            <div className="flex h-full min-h-0 flex-col gap-y-2">
              <h3 className="text-lg font-semibold">Popularity Graph</h3>
              <div className="flex h-full items-center justify-center rounded-lg border p-2">
                <p>Placeholder</p>
              </div>
            </div>
            <div className="flex justify-end gap-x-4">
              <Button asChild>
                <Link href={`/admin/products/${product.barcode}/edit`}>
                  Edit Product Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
