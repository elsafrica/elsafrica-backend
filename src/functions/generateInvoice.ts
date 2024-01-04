import PDFDocument from 'pdfkit';
import { currencyFormater } from '../utils/formatters';
import { Response } from 'express';

type Invoice = {
	number?: string,
	date?: string,
	poNumber?: string,
	dueDate?: string,
	to?: string,
	items?: {
		name: string,
		quantity: number,
		unit_cost: number
	}[],
	notes?: string,
	terms?: string,
	tax?: number,
	discount?: number,
	shipping?: number
}

export async function generateInvoice(invoice: Invoice, res: Response) {
	const doc = new PDFDocument({ size: 'A4' });

	doc.save();

	doc
		.image('./img/logo_2.png', 0, 0, { width: 180 })
		.moveDown();

	doc.fillColor('#000').fontSize(11).text('Bill to :', 20, 120);
	doc.fontSize(11).text(invoice?.to || '', 60, 120);

	doc.fillColor('#91d000').fontSize(32).text('INVOICE', 390, 20);

	doc.fillColor('#000').fontSize(11).text('Invoice NO :', 390, 70);
	doc.fontSize(11).text(invoice?.number || '', 455, 70);

	doc.fontSize(11).text('Date Created :', 390, 95);
	doc.fontSize(11).text(invoice?.date || '', 465, 95);

	doc.fontSize(11).text('Date Due :', 390, 120);
	doc.fontSize(11).text(invoice?.date || '', 445, 120);

	//Details header start
	doc.fontSize(11).text('Item', 25, 180);
	doc.fontSize(11).text('Quantity', 280, 180);
	doc.fontSize(11).text('Unit Price', 350, 180);
	doc.fontSize(11).text('Total Amount', 420, 180);
	doc.rect(16, 176, 520, 15).stroke();
	doc.moveTo(270, 176).lineTo(270, 191).stroke();
	doc.moveTo(340, 176).lineTo(340, 191).stroke();
	doc.moveTo(410, 176).lineTo(410, 191).stroke();
	//Details header end

	//Items start
	invoice.items?.forEach((item, index) => {
		doc.fontSize(11).text(item.name, 25, (200 + (index * 20)));
		doc.fontSize(11).text(item.quantity.toString(), 280, (200 + (index * 20)));
		doc.fontSize(11).text(currencyFormater(item.unit_cost), 350, (200 + (index * 20)));
		doc.fontSize(11).text(currencyFormater(item.quantity * item.unit_cost), 420, (200 + (index * 20)));
	});
	//Items end

	const subtotal = (invoice.items?.reduce((prev, item) => prev + ((item.quantity || 0) * (item.unit_cost || 0)), 0) || 0);
	const taxTotal = (invoice.tax || 0) / 100;
	const grandtotal = ((taxTotal * subtotal) + (invoice?.shipping || 0) + (subtotal || 0) - (invoice?.discount || 0));

	const totalsHeightOffset = (invoice?.items?.length || 0) * 15;

	//Totals start
	doc.fillColor('red').fontSize(11).text('Subtotal :', 380, (220 + totalsHeightOffset));
	doc.fontSize(11).text(currencyFormater(subtotal || 0), 460, (220 + totalsHeightOffset));

	doc.fillColor('#000').fontSize(11).text('Discount :', 380, (245 + totalsHeightOffset));
	doc.fillColor('#000').fontSize(11).text(currencyFormater(invoice?.discount || 0), 460, (245 + totalsHeightOffset));

	doc.fontSize(11).text('Tax :', 380, (270 + totalsHeightOffset));
	doc.fontSize(11).text(currencyFormater(invoice?.tax || 0), 460, (270 + totalsHeightOffset));

	doc.fontSize(11).text('Shipping :', 380, (295 + totalsHeightOffset));
	doc.fontSize(11).text(currencyFormater(invoice?.shipping || 0), 460, (295 + totalsHeightOffset));

	doc.moveTo(380, (320 + totalsHeightOffset)).lineTo(540, (320 + totalsHeightOffset)).stroke();

	doc.fontSize(13).text('Grand Total :', 380, (340 + totalsHeightOffset));
	doc.fontSize(13).text(currencyFormater(grandtotal), 460, (340 + totalsHeightOffset));
	//Totals end

	//Footer start
	doc.fontSize(8).text(`Notes: ${invoice?.notes}`, 40, (doc.y + 200), { align: 'center' }).moveDown();
	doc.fontSize(8).text(`Terms and Conditions: ${invoice.terms}`, { align: 'center' });
	//Footer end

	doc.end();

	res.setHeader('Content-Type', 'application/pdf');
	res.setHeader('Content-Disposition', `attachment; filename=${invoice.number}`);

	doc.pipe(res);
}
