"use server";

import {
  addProduct,
  addStock,
  deleteProduct,
  updateProduct,
} from "@/server/requests/productRequests";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { QueryKeys } from "../requests/queryKeys";
import { getCategoryIdLiterals } from "./category";

export async function addProductAction(
  _prevState: unknown,
  formData: FormData,
) {
  "use server";

  const { barcode, name, categoryId } = Object.fromEntries(formData.entries());

  const rawData = {
    barcode,
    name,
    categoryId: parseInt(categoryId as string),
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
  };

  const validatedData = z
    .object({
      barcode: z.string().min(1).max(14),
      name: z.string().min(1),
      categoryId: z.union(await getCategoryIdLiterals()),
      buyPrice: z.number().int(),
      sellPrice: z.number().int(),
      stock: z.number().int(),
    })
    .required()
    .safeParse(rawData);

  if (!validatedData.success) {
    console.error(validatedData.error);
    return { success: false, error: validatedData.error.flatten().fieldErrors };
  }

  try {
    const newProduct = await addProduct(validatedData.data);
    revalidateTag(QueryKeys.products);
    return {
      success: true,
      newProduct: newProduct,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to add product",
    };
  }
}

export async function editProductAction(
  _prevState: unknown,
  formData: FormData,
) {
  "use server";

  const { barcode, name, stock, buyPrice, sellPrice, categoryId } =
    Object.fromEntries(formData.entries());

  const roundedBuyPrice = Math.round((parseFloat(buyPrice as string) * 100)) / 100;
  const roundedSellPrice = Math.round((parseFloat(sellPrice as string) * 100)) / 100;  

  const rawData = {
    barcode,
    name,
    stock: parseInt(stock as string),
    categoryId: parseInt(categoryId as string),
    buyPrice: Math.round(roundedBuyPrice * 100),
    sellPrice: Math.round(roundedSellPrice * 100),
  };

  const validatedData = z
    .object({
      barcode: z.string().min(1).max(14),
      name: z.string().min(1).optional(),
      categoryId: z.union(await getCategoryIdLiterals()).optional(),
      buyPrice: z.number().int().optional(),
      sellPrice: z.number().int().optional(),
      stock: z.number().int().optional(),
    })
    .safeParse(rawData);

  if (!validatedData.success) {
    console.error(validatedData.error);
    return { success: false, error: validatedData.error.flatten().fieldErrors };
  }

  try {
    await updateProduct(validatedData.data);
    revalidateTag(QueryKeys.products);
    return { success: true, error: null };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to update product",
    };
  }
}

export async function buyInProductAction(
  _prevState: unknown,
  formData: FormData,
) {
  "use server";

  const { barcode, count, buyPrice, sellPrice } = Object.fromEntries(
    formData.entries(),
  );

  const rawData = {
    barcode: barcode,
    count: parseInt(count as string),
    buyPrice: Math.round(parseFloat(buyPrice as string) * 100),
    sellPrice: Math.round(parseFloat(sellPrice as string) * 100),
  };

  console.log("Original buyPrice:", buyPrice);
  console.log("Parsed float:", parseFloat(buyPrice as string));
  console.log("BuyPrice after multiplying by 100:", parseFloat(buyPrice as string) * 100);
  console.log("Rounded BuyPrice:", Math.round(parseFloat(buyPrice as string) * 100));


  const validatedData = z
    .object({
      barcode: z.string().min(1).max(14),
      count: z.number().int().min(1),
      buyPrice: z.number().int(),
      sellPrice: z.number().int(),
    })
    .required()
    .safeParse(rawData);

  if (!validatedData.success) {
    console.error(validatedData.error);
    return { success: false, error: validatedData.error.flatten().fieldErrors };
  }

  try {
    const newStock = await addStock(validatedData.data);
    revalidateTag(QueryKeys.products);
    return { success: true, newStock: newStock, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to add stock" };
  }
}

export async function DeleteProductAction(barcode: string) {
  "use server";
  try {
    await deleteProduct(barcode);
    revalidateTag(QueryKeys.products);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete product");
  }
}
