"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box } from "@/server/requests/boxRequests";
import { Product } from "@/server/requests/productRequests";
import { useRouter } from "next/navigation";

type OwnProps = {
  products: Product[];
  boxes: Box[];
};

export default function BuyInBarcodeForm({ products, boxes }: OwnProps) {
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const barcode = formData.get("barcode") as string;
    if (
      products.every((product) => product.barcode !== barcode) &&
      boxes.every((box) => box.boxBarcode !== barcode)
    ) {
      router.push(`/admin/new/product`);
      return;
    }
    router.push(`/admin/buy_in/product/${barcode}`);
  };

  return (
    <form className="flex flex-col" onSubmit={onSubmit}>
      <label htmlFor="username" className="text-sm text-stone-700">
        Barcode
      </label>
      <Input
        id="barcode"
        name="barcode"
        placeholder="Enter / read barcode..."
        required
        autoFocus
      />
      <Button type="submit" className="mt-3">
        Buy In
      </Button>
    </form>
  );
}
