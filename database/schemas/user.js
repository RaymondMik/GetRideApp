const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    type: {
        type: String,
        enum: ['driver', 'client', 'admin'], 
        required: true
    }
});

module.exports.UserSchema = UserSchema;