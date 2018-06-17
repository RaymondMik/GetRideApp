const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {RideRequest} = require('./../database/models/rideRequest.js');
const {User} = require('./../database/models/user.js');

const userIdOne = new ObjectID();
const userIdTwo = new ObjectID();

// we simulate one authenticated and one non authenticated user
const users = [
    {
        _id: userIdOne,
        email: 'ciaone1@example.com',
        password: 'userOnePass',
        type: 'client',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({_id: userIdOne, access: 'auth'}, 'abc123').toString()
            }
        ]
    },
    {
        _id: userIdTwo,
        email: 'ciaone2@example.com',
        password: 'userTwoPass',
        type: 'driver'
    }
];

const mockRideRequests = [
    {
        passengers: 3,
        status: 'closed',
        _id: new ObjectID(),
        userId: 'ioioio99',
        pickUp: 88888,
        dropOff: 9999,
        date: '2018-06-13T18:46:44.000Z'
    },
    {
        passengers: 2,
        status: 'open',
        _id: new ObjectID(),
        userId: '6565jj',
        pickUp: 5645656465,
        dropOff: 8989899889,
        date: '2018-05-13T18:46:44.000Z'
    }
];

const populateUsers = async(done) => {
    await User.remove({});
    await new User(users[0]).save();
    await new User(users[1]).save();
    done();
};

const populateRideRequests = async(done) => {
    await RideRequest.remove({});
    await RideRequest.insertMany(mockRideRequests);
    done();
};

module.exports = {mockRideRequests, populateRideRequests, populateUsers, users};
