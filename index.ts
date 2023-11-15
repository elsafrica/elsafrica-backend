import http from 'http';
import dotenv from 'dotenv';
import io from './src/functions/socket';
import app from './src/app';
dotenv.config();

const server = http.createServer(app);
const PORT = process.env.PORT || 8080;
io.listen(server);

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
