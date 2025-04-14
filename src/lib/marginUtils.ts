export const calculateMargin = (
	buy: string,
	sell: string,
	defaultMargin: number,
): number => {
	const buyNum = parseFloat(buy);
	const sellNum = parseFloat(sell);
	if (isNaN(buyNum) || isNaN(sellNum) || buyNum <= 0) return defaultMargin;
	const margin = sellNum / buyNum - 1;
	return Math.round(margin * 10000) / 10000;
};

export const calculateSellPrice = (
	buyPrice: string,
	margin: number,
): string => {
	const buyPriceNum = parseFloat(buyPrice);
	if (isNaN(buyPriceNum)) return "0.00";
	const sellPrice = buyPriceNum * (1 + margin);
	const roundedSellPrice = Math.round(sellPrice * 10000) / 10000;
	return (Math.ceil(roundedSellPrice * 100) / 100).toFixed(2);
};
