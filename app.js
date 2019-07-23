import express from 'express';
import logger from 'morgan';

const PORT = process.env.PORT || 8080;
const app = express();

// Basic logging setup
app.use(logger('dev'));

// Subset of body parser. Might have to add urlencoded also
app.use(express.json());

app.listen(PORT);
