import { getAll } from "@/server/productRequests";
import ProductTable from "./ProductTable";

async function ProductsLayout({ children }: { children: React.ReactNode }) {
  const products = await getAll();

  return (
    <div className="flex h-full w-full flex-row justify-between gap-x-8 py-16">
      <ProductTable products={products} />
      {children}
    </div>
  );
}

export default ProductsLayout;
