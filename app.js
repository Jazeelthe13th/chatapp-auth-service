import express from 'express';
import logger from 'morgan';
import mongoose from 'mongoose';
import router from './routes';
import bodyparser from 'body-parser'

const PORT = process.env.PORT || 8088;
const app = express();

// Basic logging setup
app.use(logger('dev'));

// Handles urlencoded requests
app.use(bodyparser.urlencoded({
    extended:true
}));

//use api routes in the app
app.use('/user',router);

// Handles JSON requests
app.use(express.json());

let connectToDatabase = async mongoose => {
    return await mongoose.connect('mongodb://localhost/local', {useNewUrlParser : true});
}

// Connection to MongoDB
try{
    connectToDatabase(mongoose);
} catch( error ){
    console.log('Could not establish connection with db because of the following reason: ', error);
}

const db = mongoose.connection;

// default api response For test purpose only 
app.get('/', (req, res)=>res.send('user auth service is working fine'));

// Handling error after connection has been established
db.on('error', err => {
    console.log('MongoDB connection threw the following error ', error);
});

// Logging initialization of connection
db.once('open', () => {
    console.log('Established connection with db.');
});


app.listen(PORT);
