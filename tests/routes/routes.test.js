const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../../app.js');
const {RideRequest} = require('./../../database/models/rideRequest.js');
const {User} = require('./../../database/models/user.js');
const {mockRideRequests, populateRideRequests, populateUsers, users} = require('./../databaseHandler.js');

const URL_RIDES_FRAGMENT = '/ride-requests';
const URL_USERS_FRAGMENT = '/users';

beforeEach(populateUsers);
beforeEach(populateRideRequests);

// GET me user
describe('GET users/me', () => {
    test('should return user if authenticated', (done) => {
        request(app)
            .get(`${URL_USERS_FRAGMENT}/me`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    test('should get 401 error if user is not authenticated', (done) => {
        request(app)
            .get(`${URL_USERS_FRAGMENT}/me`)
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

// POST sign up (create user)
describe('POST /users', () => {
    test('should create a new user', (done) => {
        const email = 'hello12@example.com';
        const password = 'hello123_09';
        const type = 'client';

        request(app)
            .post(URL_USERS_FRAGMENT)
            .send({email, password, type})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end( (err) => {
                if (err) return done(err);

                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    // check if password has been hashed!
                    expect(user.password).not.toBe(password);
                    done();
                }).catch((e) => done(e)); 
            });
    });

    test('should return a validation error if req is invalid', (done) => {
        const email = 'hello@example';
        const password = 'hello90';
        const type = 'client';

        request(app)
            .post(URL_USERS_FRAGMENT)
            .send({email, password, type})
            .expect(400)
            .end(done);
    });

    test('should return an error if email is already in use', (done) => {
        const email = users[0].email;
        const password = 'hello777009';
        const type = 'client';

        request(app)
            .post(URL_USERS_FRAGMENT)
            .send({email, password, type})
            .expect(400)
            .end(done);
    });
});

// POST sign in (login user)
describe('POST /users/login', () => {
    test('should create login an existing user', (done) => {          
        request(app)
            .post(`${URL_USERS_FRAGMENT}/login`)
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err, res) => {
                if (err) return done(err);

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1].access).toEqual('auth');
                    expect(user.tokens[1].token).toEqual(res.headers['x-auth']);
                    done();
                }).catch((e) => done(e)); 
            });
    });
    
    test('should reject invalid login', (done) => {
        request(app)
            .post(`${URL_USERS_FRAGMENT}/login`)
            .send({
                email: users[1].email,
                password: 'blablbla'
            })
            .expect(401)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy();
            })
            .end((err) => {
                if (err) return done(err);

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e) => done(e)); 
            });
    });
});

// POST sign out (logout user)
describe('POST users/me/logout', () => {
    test('should remove auth token on logout', (done) => {
        request(app)
            .post(`${URL_USERS_FRAGMENT}/me/logout`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err) => {
                if (err) return done(err);

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((err) => done(err));
            })

    });
});

// GET ride-requests
describe('GET /ride-requests route', () => {
    test('all ride requests should be returned', (done) => {
        request(app)
            .get(URL_RIDES_FRAGMENT)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.requests.length).toBe(2);
            })
            .end(done);
    });

    test('all ride requests should be an array of objects', (done) => {
        request(app)
            .get(URL_RIDES_FRAGMENT)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body.requests)).toBe(true);
                res.body.requests.forEach((value) => {
                    expect(typeof value).toBe('object');
                })
            })
            .end(done);
    });
});

// GET SINGLE ride-request
describe('GET /ride-requests/:id route', () => {
    test('get a single ride request', (done) => {
        request(app)
            .get(`${URL_RIDES_FRAGMENT}/${mockRideRequests[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toEqual(mockRideRequests[0]._id.toHexString());
            })
            .end(done);  
    });

    test('single ride request created by other user is not accessible', (done) => {
        request(app)
            .get(`${URL_RIDES_FRAGMENT}/${mockRideRequests[2]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    test('single ride request not found', (done) => {
        const newHexId = new ObjectID().toHexString();
        request(app)
            .get(`${URL_RIDES_FRAGMENT}/${newHexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    test('invalid id passed to the request', (done) => {
        request(app)
            .get(`${URL_RIDES_FRAGMENT}/wow1234`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end(done);  
    });
});

// POST ride-request
describe('POST /ride-requests route', () => {
    test('Should add a new ride request', (done) => {
        const newRideRequest = {
            _creator: users[1]._id,
            passengers: 1,
            status: 'open',
            pickUp: 888884,
            dropOff: 99994
        };

        request(app)
            .post(URL_RIDES_FRAGMENT)
            .set('x-auth', users[1].tokens[0].token)
            .send(newRideRequest)
            .expect(200)
            .expect((res) => {
                expect(res.body._creator).toEqual(newRideRequest._creator.toHexString());
            })
            .end((err, res) => {
                if (err) return done(err);
                RideRequest.find({
                    _creator: res.body._creator
                }).then((rideRequest) => {
                    const newRide = rideRequest.find(({pickUp, dropOff}) => {
                        return pickUp === newRideRequest.pickUp && dropOff === newRideRequest.dropOff;
                    });
                    // test if rideRequest has been correctly inserted into db
                    expect(newRide._creator).toEqual(newRideRequest._creator);
                    expect(newRide.pickUp).toEqual(newRideRequest.pickUp);
                    done();
                }).catch((e) => done(e));
            });   
    });

    test('Should NOT add a new invalid ride request', (done) => {
        const newInvalidRideRequest = {
            passengers: 'hello',
            userId: 96,
            pickUp: 888884,
            dropOff: 'I am invalid'
        };

        request(app)
            .post(URL_RIDES_FRAGMENT)
            .set('x-auth', users[0].tokens[0].token)
            .send(newInvalidRideRequest)
            .expect(400)
            .expect((res) => {
                expect(res.body.name).toEqual('ValidationError');
            })
            .end((err, res) => {
                expect()
                if (err) return done(err);
                RideRequest.find().then((rideRequests) => {
                    expect(rideRequests.length).toBe(mockRideRequests.length);
                    done();
                }).catch((e) => done(e));
            });
    });
});

// DELETE ride request
describe('DELETE /ride-requests/:id route', () => {
    test('ride-request was deleted correctly', (done) => {
        const hexId = mockRideRequests[0]._id.toHexString();
        request(app)
            .delete(`${URL_RIDES_FRAGMENT}/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => expect(res.body._id).toBe(mockRideRequests[0]._id.toHexString())) 
            .end(((err, res) => { 
                if (err) return done(err); 
                
                RideRequest.findById(hexId).then((rideRequest) => {
                    expect(rideRequest).toBeFalsy();
                    done();
                }).catch( (e) => done(e));
            }));  

    });

    test('trying to delete a ride-request created by another user should fire a 404 error', (done) => {
        request(app)
            .delete(`${URL_RIDES_FRAGMENT}/${mockRideRequests[2]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);  
    });

    test('non existing ride-request should fire a 404 error', (done) => {
        const newHexId = new ObjectID().toHexString();
        request(app)
            .delete(`${URL_RIDES_FRAGMENT}/${newHexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);  
    });

    test('an invalid id should fire a 400 error', (done) => {
        request(app)
            .delete(`${URL_RIDES_FRAGMENT}/bubu1234`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end(done);  
    });
});

// UPDATE ride request
describe('PATCH /ride-request/:id route', () => {
    test('ride request was correctly updated', (done) => {
        const hexId = mockRideRequests[1]._id.toHexString();
        request(app)
            .patch(`${URL_RIDES_FRAGMENT}/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                status: 'closed'
            })
            .expect(200)
            .expect((res) => expect(res.body.rideRequest.status).toEqual('closed'))
            .end(((err, res) => { 
                if (err) return done(err); 
                
                RideRequest.findById(hexId).then((rideRequest) => {
                    expect(rideRequest.status).toEqual('closed');
                    done();
                }).catch( (e) => done(e));
            }));  
    });

    test('trying to uopdate ride request create by another user should fire a 404 error', (done) => {
        request(app)
            .patch(`${URL_RIDES_FRAGMENT}/${mockRideRequests[2]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                status: 'closed'
            })
            .expect(404)
            .end(done);  
    });

    test('ride request id not found should fire a 404 error', (done) => {
        const newHexId = new ObjectID().toHexString();
        request(app)
            .patch(`${URL_RIDES_FRAGMENT}/${newHexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                status: 'closed'
            })
            .expect(404)
            .end(done);  
    });

    test('an invalid id should fire a 400 error', (done) => {
        request(app)
            .patch(`${URL_RIDES_FRAGMENT}/dog1234`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                status: 'closed'
            })
            .expect(400)
            .end(done);  
    });
});