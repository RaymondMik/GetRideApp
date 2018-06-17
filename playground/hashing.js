const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const password = 'Puppoli';
bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hashedPassword) => {
    bcrypt.compare('password', hashedPassword, (err, res) => {
      console.log(22, res);
    });
  });
});

//var hashedPassword = '$2a$10$huAU4qTnQuGPifHEXfV9cOmPJ7p61oKaoXrY1WviiDAznE/rW8oLK';

// var data = {
//   id: 10
// };

// var token = jwt.sign(data, '123abc');
// console.log(token);

// var decoded = jwt.verify(token, '123abc');
// console.log('decoded', decoded);

// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
// if (resultHash === token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed. Do not trust!');
// }
