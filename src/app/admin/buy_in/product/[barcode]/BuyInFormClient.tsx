"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { calculateSellPrice } from "@/lib/marginUtils";
import { buyInProductAction } from "@/server/actions/products";
import { buyInBox } from "@/server/requests/boxRequests";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BoxData = {
  boxBarcode: string;
  itemsPerBox: number;
  productBarcode: string;
  productName: string;
  buyPrice?: number;
  sellPrice?: number;
  productStock?: number;
};

type ProductData = {
  barcode: string;
  name: string;
  stock: number;
  buyPrice?: number;
  sellPrice?: number;
  category: { categoryId: number; description: string };
};

export default function BuyInFormClient({
  box,
  product,
  defaultMargin,
}: {
  box: BoxData | null;
  product: ProductData | null;
  defaultMargin: number;
}) {
  const [boxCount, setBoxCount] = useState<string>("1");
  const [productQuantity, setProductQuantity] = useState<string>("1");
  const [buyPrice, setBuyPrice] = useState<string>("");
  const [sellPrice, setSellPrice] = useState<string>("");
  const [isCustomMargin, setIsCustomMargin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage] = useState<string | null>(
    box ? "Box found in the database!" : product ? "Product found in the database!" : null
  );
  const { toast } = useToast();
  const router = useRouter();

  const initialBuyPrice = box ? box.buyPrice : product ? product.buyPrice : 0;
  const initialSellPrice = box ? box.sellPrice : product ? product.sellPrice : 0;
  const initialMargin = initialBuyPrice && initialSellPrice
    ? ((initialSellPrice / initialBuyPrice) * 100 - 100) / 100
    : defaultMargin;

  const [activeMargin, setActiveMargin] = useState<number>(initialMargin);

  useEffect(() => {
    const buy = parseFloat(buyPrice || (box ? (box.buyPrice! / 100).toFixed(2) : (product ? (product.buyPrice! / 100).toFixed(2) : "0")));
    const sell = parseFloat(sellPrice || (box ? (box.sellPrice! / 100).toFixed(2) : (product ? (product.sellPrice! / 100).toFixed(2) : "0")));
    if (buy && sell && buy > 0) {
      const margin = (sell / buy) * 100 - 100;
      setActiveMargin(margin / 100);
    } else {
      setActiveMargin(defaultMargin);
    }
  }, [buyPrice, sellPrice, box, product, defaultMargin]);

  const handleBuyPriceChange = (value: string) => {
    setBuyPrice(value);
    if (value === "") {
      setSellPrice("");
      setIsCustomMargin(false);
    } else if (!isCustomMargin) {
      const newSellPrice = calculateSellPrice(value, defaultMargin);
      setSellPrice(newSellPrice);
    }
  };

  const handleSellPriceChange = (value: string) => {
    setSellPrice(value);
    if (value === "") {
      setIsCustomMargin(false);
    } else {
      setIsCustomMargin(true);
    }
  };

  const handleClear = () => {
    setBoxCount("1");
    setProductQuantity("1");
    setBuyPrice("");
    setSellPrice("");
    setIsCustomMargin(false);
    setActiveMargin(initialMargin);
    setError(null);
    router.push("/admin/buy_in");
  };

  const handleBoxBuyIn = async () => {
    if (!box || !boxCount) {
      setError("Please enter a valid number of boxes");
      return;
    }

    const boxCountNum = Number(boxCount);
    if (isNaN(boxCountNum) || boxCountNum <= 0) {
      setError("Please enter a valid number of boxes");
      return;
    }

    try {
      const finalBuyPrice = buyPrice ? Math.round(Number(buyPrice) * 100) : box.buyPrice!;
      const finalSellPrice = sellPrice ? Math.round(Number(sellPrice) * 100) : box.sellPrice!;
      if (!finalBuyPrice || !finalSellPrice) {
        setError("Please enter valid buy and sell prices");
        return;
      }

      await buyInBox({
        barcode: box.boxBarcode,
        boxCount: boxCountNum,
        productBuyPrice: finalBuyPrice,
        productSellPrice: finalSellPrice,
      });

      const totalItemsAdded = boxCountNum * box.itemsPerBox;
      toast({
        title: "Buy-In Successful",
        description: `Added ${totalItemsAdded} items of ${box.productName} (${box.productBarcode}) (${boxCountNum} box(es) with barcode ${box.boxBarcode})`,
        duration: 6000,
      });
      router.push(`/admin/products/${box.productBarcode}`);
      router.refresh();
    } catch (err: any) {
      setError("Failed to add boxes to inventory");
    }
  };

  const handleProductBuyIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product || !productQuantity) {
      setError("Quantity must be a number greater than 0");
      return;
    }

    const quantityNum = Number(productQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError("Quantity must be a number greater than 0");
      return;
    }

    try {
      const finalBuyPrice = buyPrice ? Math.round(Number(buyPrice) * 100) : product.buyPrice!;
      const finalSellPrice = sellPrice ? Math.round(Number(sellPrice) * 100) : product.sellPrice!;
      if (!finalBuyPrice || !finalSellPrice) {
        setError("Please enter valid buy and sell prices");
        return;
      }

      const formData = new FormData();
      formData.append("barcode", product.barcode);
      formData.append("count", quantityNum.toString());
      formData.append("buyPrice", (finalBuyPrice / 100).toString());
      formData.append("sellPrice", (finalSellPrice / 100).toString());

      const result = await buyInProductAction(null, formData);
      if (result.success && result.newStock) {
        toast({
          title: "Buy-In Successful",
          description: `Added ${productQuantity} items of product ${product.name}`,
          duration: 6000,
        });
        router.push(`/admin/products/${product.barcode}`);
        router.refresh();
      } else {
        setError("Failed to add product to stock");
      }
    } catch (err: any) {
      setError("Failed to add product to stock");
    }
  };

  const totalItems = box && boxCount ? Number(boxCount) * box.itemsPerBox : 0;
  const newBoxStock = box && boxCount ? (box.productStock ?? 0) + totalItems : null;
  const newProductStock = product && productQuantity ? (product.stock ?? 0) + Number(productQuantity) : null;

  const formatPriceForDisplay = (priceInCents?: number) => {
    if (priceInCents === undefined || priceInCents === null) return "N/A";
    if (typeof priceInCents !== "number") return "Error";
    return `${(priceInCents / 100).toFixed(2).replace(".", ",")} €`;
  };

  const isDefaultMargin = Math.abs(activeMargin - defaultMargin) < 0.001;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-fit flex-col items-start gap-y-4">
        <div className="flex flex-col items-center rounded-lg border border-stone-300 bg-white p-6 shadow-lg w-96">
          <div className="flex flex-col gap-y-3 w-full">
            {box ? (
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-col gap-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm"><strong>Box Barcode:</strong> {box.boxBarcode}</p>
                    <Button variant="outline" className="h-6 w-6 p-1" onClick={handleClear} type="button"><X className="h-4 w-4" /></Button>
                  </div>
                  {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
                </div>
                <p className="text-sm"><strong>Items Per Box:</strong> {box.itemsPerBox}</p>
                <p className="text-sm"><strong>Product Name:</strong> {box.productName}</p>
                <p className="text-sm"><strong>Product Barcode:</strong> {box.productBarcode}</p>
                <p className="text-sm"><strong>Current Stock:</strong> {box.productStock ?? "N/A"}</p>
                <div>
                  <label htmlFor="boxCount" className="text-sm text-stone-700">Number of Boxes</label>
                  <Input
                    id="boxCount"
                    name="boxCount"
                    type="number"
                    value={boxCount}
                    onChange={(e) => setBoxCount(e.target.value)}
                    className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label htmlFor="buyPrice" className="text-sm text-stone-700">Adjust Buy Price (optional)</label>
                  <Input
                    id="buyPrice"
                    name="buyPrice"
                    type="number"
                    value={buyPrice}
                    onChange={(e) => handleBuyPriceChange(e.target.value)}
                    min={0}
                    step="0.01"
                    placeholder={formatPriceForDisplay(box.buyPrice)}
                    className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label htmlFor="sellPrice" className="text-sm text-stone-700">Adjust Sell Price (optional)</label>
                  <Input
                    id="sellPrice"
                    name="sellPrice"
                    type="number"
                    value={sellPrice}
                    onChange={(e) => handleSellPriceChange(e.target.value)}
                    min={0}
                    step="0.01"
                    placeholder={formatPriceForDisplay(box.sellPrice)}
                    className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div className="text-sm text-stone-500">
                  {isDefaultMargin
                    ? `Default margin applied: ${(defaultMargin * 100).toFixed(0)}%`
                    : `Current margin: ${(activeMargin * 100).toFixed(0)}% (Default margin: ${(defaultMargin * 100).toFixed(0)}%)`}
                </div>
                {boxCount && Number(boxCount) > 0 && (
                  <p className="text-sm"><strong>Total items to add:</strong> {totalItems} (new stock: {newBoxStock})</p>
                )}
                <Button onClick={handleBoxBuyIn} className="mt-2">Confirm Buy-In (Box)</Button>
              </div>
            ) : product ? (
              <form onSubmit={handleProductBuyIn} className="flex flex-col gap-y-2">
                <div className="flex flex-col gap-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm"><strong>Product Barcode:</strong> {product.barcode}</p>
                    <Button variant="outline" className="h-6 w-6 p-1" onClick={handleClear} type="button"><X className="h-4 w-4" /></Button>
                  </div>
                  {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
                </div>
                <p className="text-sm"><strong>Product Name:</strong> {product.name}</p>
                <p className="text-sm"><strong>Current Stock:</strong> {product.stock}</p>
                <div>
                  <label htmlFor="count" className="text-sm text-stone-700">Quantity</label>
                  <Input
                    id="count"
                    name="count"
                    type="number"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(e.target.value)}
                    className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label htmlFor="buyPrice" className="text-sm text-stone-700">Adjust Buy Price (optional)</label>
                  <Input
                    id="buyPrice"
                    name="buyPrice"
                    type="number"
                    value={buyPrice}
                    onChange={(e) => handleBuyPriceChange(e.target.value)}
                    min={0}
                    step="0.01"
                    placeholder={formatPriceForDisplay(product.buyPrice)}
                    className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label htmlFor="sellPrice" className="text-sm text-stone-700">Adjust Sell Price (optional)</label>
                  <Input
                    id="sellPrice"
                    name="sellPrice"
                    type="number"
                    value={sellPrice}
                    onChange={(e) => handleSellPriceChange(e.target.value)}
                    min={0}
                    step="0.01"
                    placeholder={formatPriceForDisplay(product.sellPrice)}
                    className="w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div className="text-sm text-stone-500">
                  {isDefaultMargin
                    ? `Default margin applied: ${(defaultMargin * 100).toFixed(0)}%`
                    : `Current margin: ${(activeMargin * 100).toFixed(0)}% (Default margin: ${(defaultMargin * 100).toFixed(0)}%)`}
                </div>
                {productQuantity && Number(productQuantity) > 0 && (
                  <p className="text-sm"><strong>Total items to add:</strong> {productQuantity} (new stock: {newProductStock})</p>
                )}
                <Button type="submit" className="mt-2">Confirm Buy-In (Product)</Button>
              </form>
            ) : (
              <div><p className="text-sm text-black-500">Loading data...</p></div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}