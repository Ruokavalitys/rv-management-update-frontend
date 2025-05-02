"use server";

import { authenticated } from "../wrappers";
import { AdminProduct } from "./productRequests";

const targetUrl = "api/v1/admin/boxes";

export type Box = {
	boxBarcode: string;
	itemsPerBox: number;
	product: Omit<AdminProduct, "buyPrice">;
};

export const getAllBoxes = async () => {
	return await authenticated<{ boxes: Box[] }>(
		`${process.env.RV_BACKEND_URL}/${targetUrl}`,
		{
			method: "GET",
		},
	).then((data) => data.boxes);
};

type createBoxRequest = {
	boxBarcode: string;
	itemsPerBox: number;
	productBarcode: string;
};

export const createBox = async (box: createBoxRequest) => {
	return await authenticated<{ box: Box }>(
		`${process.env.RV_BACKEND_URL}/${targetUrl}`,
		{
			method: "POST",
		},
		box,
	).then((res) => res.box);
};

type updateBoxRequest = {
	boxBarcode: string;
	itemsPerBox?: number;
	productBarcode?: string;
};

export const updateBox = async (box: updateBoxRequest) => {
	return await authenticated<{ box: Box }>(
		`${process.env.RV_BACKEND_URL}/${targetUrl}/${box.boxBarcode}`,
		{
			method: "PATCH",
		},
		{
			itemsPerBox: box.itemsPerBox,
			productBarcode: box.productBarcode,
		},
	).then((res) => res.box);
};

export const deleteBox = async (boxBarcode: string) => {
	return await authenticated<{ deletedBox: Box }>(
		`${process.env.RV_BACKEND_URL}/${targetUrl}/${boxBarcode}`,
		{
			method: "DELETE",
		},
	).then((res) => res.deletedBox);
};

type buyInBoxRequest = {
	barcode: string;
	boxCount: number;
	productBuyPrice: number;
	productSellPrice: number;
};

export const buyInBox = async (box: buyInBoxRequest) => {
	return await authenticated<{ box: Box }>(
		`${process.env.RV_BACKEND_URL}/${targetUrl}/${box.barcode}/buyIn`,
		{
			method: "POST",
		},
		{
			boxCount: box.boxCount,
			productBuyPrice: box.productBuyPrice,
			productSellPrice: box.productSellPrice,
		},
	).then((res) => res.box);
};
