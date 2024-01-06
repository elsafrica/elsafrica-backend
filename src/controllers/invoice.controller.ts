import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { validationResult } from 'express-validator';
import { generateInvoice } from '../functions/generateInvoice';
import moment from 'moment';

export async function getRecentInvoiceNumber(req: Request, res: Response) : Promise<void> {
	try {
		const invoice = await Invoice
			.find({})
			.sort({
				createdAt: 'desc'
			})
			.limit(1);

		res.status(200).send({
			current: invoice[0].number
		});
	} catch (error) {
		res.status(500).send({ err: 'Internal server error'});
	}
}

export async function createInvoice(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).send({ err: 'Error: Bad request', errors: result.array() });
	}

	try {
		const { body } = req;

		const newInvoice = new Invoice(body);
		
		await newInvoice.save();

		generateInvoice(body, res);
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function downloadInvoice(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).send({ err: 'Error: Bad request', errors: result.array() });
	}

	try {
		const id = req.params;

		const invoice = await Invoice.findById(id);

		const invoiceObj = {
			number: invoice?.number || '',
			date: moment(invoice?.date).format('DD/MM/YYYY').toString(),
			poNumber: invoice?.poNumber || '',
			dueDate: moment(invoice?.dueDate).format('DD/MM/YYYY').toString(),
			to: invoice?.to || '',
			items: invoice?.items,
			notes: invoice?.notes || '',
			terms: invoice?.terms || '',
			tax: invoice?.tax || 0,
			discount: invoice?.discount || 0,
			shipping: invoice?.shipping || 0
		};

		generateInvoice(invoiceObj, res);
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getInvoices(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).send({ err: 'Error: Bad request', errors: result.array() });
	}

	const { pageNum = 0, rowsPerPage = 10 } = req.query;

	try {
		const invoices = await Invoice
			.find({})
			.skip(Number(pageNum) * Number(rowsPerPage))
			.limit(Number(rowsPerPage));

		const invoiceCount = await Invoice
			.countDocuments();

		return res.status(200).send({ invoices, dataLength: invoiceCount });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function deleteInvoice(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).send({ err: 'Error: Bad request', errors: result.array() });
	}

	const { id } = req.params;

	if (!id || id?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	try {
		const exists = await Invoice.findById(id);

		if (!exists) {
			return res.status(409).send({ err: 'The invoice you are attempting to delete doesn\'t exist.' });
		}

		await Invoice.findByIdAndDelete(id);

		return res.status(201).send({ msg: 'invoice has been successfully deleted.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

