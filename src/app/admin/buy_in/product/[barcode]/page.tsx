"use server";

import { getAllBoxes } from "@/server/requests/boxRequests";
import { getMargin } from "@/server/requests/globalMarginRequests";
import { getAllProducts } from "@/server/requests/productRequests";
import BuyInFormClient from "./BuyInFormClient";

export default async function BuyInProductPage({
  params,
}: {
  params: { barcode: string };
}) {
  const defaultMargin = await getMargin();
  const boxes = await getAllBoxes();
  const products = await getAllProducts();

  const foundBox = boxes.find((b) => b.boxBarcode === params.barcode);
  if (foundBox) {
    const boxData = {
      boxBarcode: foundBox.boxBarcode,
      itemsPerBox: foundBox.itemsPerBox,
      productBarcode: foundBox.product.barcode,
      productName: foundBox.product.name,
      buyPrice: foundBox.product.buyPrice,
      sellPrice: foundBox.product.sellPrice,
      productStock: foundBox.product.stock,
    };
    return <BuyInFormClient box={boxData} product={null} defaultMargin={defaultMargin} />;
  }

  const foundProduct = products.find((p) => p.barcode === params.barcode);
  if (foundProduct) {
    const productData = {
      barcode: foundProduct.barcode,
      name: foundProduct.name,
      stock: foundProduct.stock,
      buyPrice: foundProduct.buyPrice,
      sellPrice: foundProduct.sellPrice,
      category: foundProduct.category,
    };
    return <BuyInFormClient box={null} product={productData} defaultMargin={defaultMargin} />;
  }

  return <div>Barcode not found</div>;
}