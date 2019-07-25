
import mongoose from 'mongoose';


// User schema with required fields
let userSchema = new mongoose.Schema({
    email : { type : String, required : true, index : { unique : true } },
    password : { type : String, required : true },
    salt : { type : String, required : true },
    iterations : { type : Number, required : true }
});

let userModel = mongoose.model('User', userSchema);

module.exports = userModel;
