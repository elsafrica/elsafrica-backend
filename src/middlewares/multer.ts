import multer, { diskStorage } from 'multer';
import { checkFileType } from '../utils/file';
import fs from 'fs';

const storage = diskStorage({
	destination: function (req, file, cb) {
		fs.stat(`${__dirname.slice(0, __dirname.length - 11)}tmp/my-uploads`, (err, stat) => {
			if(err) {
				fs.mkdirSync(`${__dirname.slice(0, __dirname.length - 11)}tmp/my-uploads`, { recursive: true });
			} else if(stat.isDirectory()) {
				cb(null, `${__dirname.slice(0, __dirname.length - 11)}tmp/my-uploads`);
			}
		});
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now();
		cb(null, file.fieldname + '-' + uniqueSuffix);
	},
	
});

export const csvUploads = multer({ 
	storage,
	fileFilter(req, file, callback) {
		checkFileType(file, callback);
	},
});