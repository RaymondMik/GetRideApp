const mongoose = require('mongoose');

//mongoose setup
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports.mongoose = mongoose;