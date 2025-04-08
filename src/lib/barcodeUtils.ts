export const generateEAN13Barcode = (): string => {
	let barcode = "";
	for (let i = 0; i < 12; i++) {
		barcode += Math.floor(Math.random() * 10).toString();
	}
	const checkDigit = calculateEAN13CheckDigit(barcode);
	barcode += checkDigit;
	return barcode;
};

const calculateEAN13CheckDigit = (barcode: string): string => {
	let sum = 0;
	for (let i = 0; i < 12; i++) {
		const digit = parseInt(barcode.charAt(i));
		if (i % 2 === 0) {
			sum += digit;
		} else {
			sum += digit * 3;
		}
	}
	const checkDigit = (10 - (sum % 10)) % 10;
	return checkDigit.toString();
};
