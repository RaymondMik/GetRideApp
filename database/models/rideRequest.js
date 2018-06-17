const mongoose = require('mongoose');
const {RideRequestSchema} = require('../schemas/rideRequest.js');
const RideRequest = mongoose.model('RideRequest', RideRequestSchema);

module.exports.RideRequest = RideRequest;