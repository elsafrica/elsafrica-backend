export const currencyFormater = (value: number) : string => {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'Ksh',
		minimumFractionDigits: 0,
	});

	return formatter.format(value);
};
