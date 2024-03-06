"use client";

import Barcode from "@/components/Barcode";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Product, deleteProduct } from "@/server/requests/productRequests";
import { QueryKeys } from "@/server/requests/queryKeys";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";
import { revalidateTag } from "next/cache";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const ProductView = ({ product }: { product: Product }) => {
  const { toast } = useToast();
  const router = useRouter();

  return (
    <div className="flex h-full w-full flex-col justify-between gap-y-4">
      <div className="flex w-full flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="flex flex-col gap-y-2">
          <label htmlFor="weight" className="text-sm text-stone-500">
            Weight
          </label>
          <p id="weight">{product.weight} g</p>
        </div>
        <div className="flex flex-col gap-y-2">
          <label htmlFor="stock" className="text-sm text-stone-500">
            Stock
          </label>
          <p id="stock" className={product.stock < 0 ? "text-red-500" : ""}>
            {product.stock}
          </p>
        </div>
        <div className="flex flex-col gap-y-2">
          <label htmlFor="category" className="text-sm text-stone-500">
            Category
          </label>
          <p id="category">{product.category.description}</p>
        </div>
        <div className="flex flex-col gap-y-2">
          <label htmlFor="buyPrice" className="text-sm text-stone-500">
            Buy Price
          </label>
          <p id="buyPrice">{(product.buyPrice / 100).toFixed(2)} €</p>
        </div>
        <div className="flex flex-col gap-y-2">
          <label htmlFor="sellPrice" className="text-sm text-stone-500">
            Sell Price
          </label>
          <p id="sellPrice">{(product.sellPrice / 100).toFixed(2)} €</p>
        </div>
      </div>
      <div>
        <div
          className="mb-8 flex cursor-pointer flex-col items-center self-center transition-all hover:scale-110"
          onClick={() => {
            navigator.clipboard.writeText(product.barcode);
            toast({ title: "Barcode copied to clipboard", duration: 2000 });
          }}
        >
          <Barcode
            barcode={product.barcode}
            width={3}
            height={125}
            displayInvalid
          />
        </div>
        <div className="flex gap-x-4">
          <Button asChild>
            <Link href={`/admin/products/${product.barcode}/edit`}>Edit</Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Product</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the listing for this product. Product data
                  will remain attached to past purchase history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    className="bg-red-500 hover:bg-red-600"
                    onClick={async () => {
                      try {
                        router.replace("/admin/products");
                        const deletedProduct = await deleteProduct(
                          product.barcode,
                        );
                        if (!deletedProduct) {
                          throw new Error("Product not deleted");
                        }
                        revalidateTag(QueryKeys.products);
                        toast({ title: "Product deleted", duration: 2000 });
                      } catch (error) {
                        router.replace("/admin/products/" + product.barcode);
                        toast({
                          title: "Error deleting product",
                          duration: 2000,
                        });
                      }
                    }}
                  >
                    Delete
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
