import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    surname: {type: String, required: true},
    gender: {type: String, required: true},
    address: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    profilePicture: {type: String},
    creditCardNumber: {type: String, required: true},
    userType: {type: String, required: true},
    status: {type: String, default: 'waiting_for_approval'}
});

export default mongoose.model('User', userSchema, 'users');