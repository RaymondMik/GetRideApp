const mongoose = require('mongoose');

const RideRequestSchema = mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        minlength: 1 
    },
    pickUp: { 
        type: Number, // Decimal Degrees ex.41.40338, 2.17403
        required: true 
    },
    dropOff: { 
        type: Number, // Decimal Degrees ex.41.40338, 2.17403
        required: true 
    }, 
    passengers: { 
        type: Number, 
        min: 1, 
        max: 4, 
        required: true, 
        default: 1 
    },
    date: { 
        type: Date, 
        required: false, 
        default: Date.now, 
    },
    status: { 
        type: String, 
        enum: ['open', 'accepted', 'rejected', 'cancelled', 'closed'], 
        required: false, 
        default: 'open' 
    }
});

module.exports.RideRequestSchema = RideRequestSchema;
