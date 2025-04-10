export const calculateMargin = (
	buy: string,
	sell: string,
	defaultMargin: number,
): number => {
	const buyNum = parseFloat(buy);
	const sellNum = parseFloat(sell);
	if (isNaN(buyNum) || isNaN(sellNum) || buyNum === 0) return defaultMargin;
	return sellNum / buyNum - 1;
};

export const calculateSellPrice = (
	buyPrice: string,
	margin: number,
): string => {
	const buyPriceNum = parseFloat(buyPrice);
	if (isNaN(buyPriceNum)) return "0.00";
	return (buyPriceNum * (1 + margin)).toFixed(2);
};