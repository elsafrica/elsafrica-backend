import { FileFilterCallback } from 'multer';
import path from 'path';

export function checkFileType(file: Express.Multer.File, cb: FileFilterCallback){
	// Allowed ext
	const filetypes = /csv/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);

	if(mimetype && extname){
		return cb(null, true);
	} else {
		return cb(null, false);
	}
}