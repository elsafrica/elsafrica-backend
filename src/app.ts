import express from 'express';
import cors from 'cors';
import passport from 'passport';
import routes from './routes/index';
import { passportStatic } from './middlewares/auth';
import './db';
passportStatic(passport);

const app = express();

const corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	redentials: true,
};

app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use('/api', routes);

export default app;