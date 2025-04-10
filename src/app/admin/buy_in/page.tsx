import { getAllBoxes } from "@/server/requests/boxRequests";
import { getAllProducts } from "@/server/requests/productRequests";
import BuyInBarcodeForm from "./BarcodeForm";

export default async function BuyInLandingPage() {
  const products = await getAllProducts();
  const boxes = await getAllBoxes();

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-fit flex-col items-start gap-y-4">
        <h1 className="text-3xl font-semibold">Buy In</h1>
        <div className="flex flex-col items-center rounded-lg border border-stone-300 bg-white p-8 shadow-lg">
          <BuyInBarcodeForm products={products} boxes={boxes} />
        </div>
      </div>
    </div>
  );
}