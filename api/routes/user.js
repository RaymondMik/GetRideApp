const express = require('express');
const router = express.Router();
const {ObjectID} = require('mongodb');
const {mongoose} = require('../../database/mongoose.js');
const {User} = require('../../database/models/user.js');
const {authenticate} = require('../../middlewares/authenticate');

// GET me user
router.get('/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST sign up (create new user)
router.post('/', (req, res) => {
    const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        type: req.body.type
    });
    
    newUser.save().then(() => {
        return newUser.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(newUser);
    }).catch((err) => {
        res.sendStatus(400);
    });
});

// POST sign in (log in existing user)
router.post('/login', (req, res) => {
    const loginRequest = {
        email: req.body.email,
        password: req.body.password
    }
    
    User.findByCredentials(loginRequest).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((err) => res.sendStatus(401));
});

// POST sign out (log out user)
router.post('/me/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send('Logged out');
    }).catch(() => res.status(401));
});

module.exports = router;