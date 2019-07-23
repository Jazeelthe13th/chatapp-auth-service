import mongoose from 'mongoose';
import crypto from 'crypto';
import {Promise} from 'bluebird';

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

// Handling error after connection has been established
db.on('error', err => {
    console.log('MongoDB connection threw the following error ', error);
});

// Logging initialization of connection
db.once('open', () => {
    console.log('Established connection with db.');
});

// User schema with required fields
let userSchema = new mongoose.Schema({
    email : { type : String, required : true, index : { unique : true } },
    password : { type : String, required : true },
    salt : { type : String, required : true },
    iterations : { type : Number, required : true }
});

let userModel = mongoose.model('User', userSchema);

let randomBytes = Promise.promisify(crypto.randomBytes);
let pbkdf2 = Promise.promisify(crypto.pbkdf2);

let salt = randomBytes(128).then(value => value.toString('base64'));
let iterations = 1000;
let hash = pbkdf2('mypassword', salt, iterations).then(key => key.toString('hex'));

console.log(hash);

