import { connect } from 'mongoose';
import { settings } from '../config/config';
const { database } = settings;

connect(`${database}elsafrica-grp`)
	.then(() => console.log('DB connected sucessfullly'))
	.catch((e: Error) => console.log(e));