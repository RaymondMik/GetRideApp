const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {UserSchema} = require('../schemas/user.js');

/**
 * Format JSON response 
 * instance method running on a document
 * @returns {Object} 
 */
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  const email = userObject.email;
  const _id = userObject._id;

  return {email, _id};
};

/**
 * Generate authentication token 
 * instance method running on a document
 * @returns {Promise} 
 */
UserSchema.methods.generateAuthToken = function () {
  const access = 'auth';
  const token = jwt.sign({_id: this._id.toHexString(), access}, 'abc123').toString();

  this.tokens = this.tokens.concat([{access, token}]);

  return this.save().then(() => {
    return token;
  });
};

/**
 * Find user by token
 * model method running on a model
 * @param {*} token 
 */
UserSchema.statics.findByToken = function (token) {
  let decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  return this.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

/**
 * Find user by credentials
 * model method running on a model
 * @param {email, password} 
 */
UserSchema.statics.findByCredentials = function ({email, password}) {
  return User.findOne({email}).then((user) => {
    if (!user) Promise.reject();

    return bcrypt.compare(password, user.password).then((res) => {
      if (!res) {
        throw new Error('invalid password');
      } else {
        return user;
      }
    });
  });
}

/**
 * Save hashed and salted password
 * middleware runs before every save event on a model instance
 */
UserSchema.pre('save', function(next) {
  // run this middleware only if password in Schema was modified
  if (this.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(this.password, salt, (err, hashedPassword) => {
        this.password = hashedPassword;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('user', UserSchema);

module.exports.User = User;