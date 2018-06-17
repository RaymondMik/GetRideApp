const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../../app.js');
const {RideRequest} = require('./../../database/models/rideRequest.js');
const {mockRideRequests, populateRideRequests} = require('./../databaseHandler.js');

const URL_FRAGMENT = '/ride-requests';

beforeEach(populateRideRequests);

// GET ride-requests
describe('GET /ride-requests route', () => {
    test('all ride requests should be returned', (done) => {
        request(app)
            .get(URL_FRAGMENT)
            .expect(200)
            .expect((res) => {
                expect(res.body.requests.length).toBe(mockRideRequests.length);
            })
            .end(done);
    });

    test('all ride requests should be an array of objects', (done) => {
        request(app)
            .get(URL_FRAGMENT)
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
            .get(`${URL_FRAGMENT}/${mockRideRequests[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toEqual(mockRideRequests[0]._id.toHexString());
            })
            .end(done);  
    });

    test('single ride request not found', (done) => {
        const newHexId = new ObjectID().toHexString();
        request(app)
            .get(`${URL_FRAGMENT}/${newHexId}`)
            .expect(404)
            .end(done);
    });

    test('invalid id passed to the request', (done) => {
        request(app)
            .get(`${URL_FRAGMENT}/wow1234`)
            .expect(400)
            .end(done);  
    });
});

// POST ride-request
describe('POST /ride-requests route', () => {
    test('Should add a new ride request', (done) => {
        const newRideRequest = {
            passengers: 1,
            status: 'open',
            userId: 'ioioio91',
            pickUp: 888884,
            dropOff: 99994
        };

        RideRequest.find().then(() => {
            request(app)
            .post(URL_FRAGMENT)
            .send(newRideRequest)
            .expect(200)
            .expect((res) => {
                for (let value in res.body) {
                    if (res.body.hasOwnProperty(value) && value !== '__v' && value !== '_id' && value !== 'date') {
                        expect(res.body[value]).toEqual(newRideRequest[value]);
                    }
                }
            })
            .end((err, res) => {
                if (err) return done(err);
                RideRequest.find(newRideRequest).then((rideRequest) => {
                    // test if rideRequest is unique
                    expect(rideRequest.length).toBe(1);
                    // test if rideRequest has been correctly inserted into db
                    expect(rideRequest[0].userId).toEqual(newRideRequest.userId);
                    done();
                }).catch((e) => done(e));
            });   
        });
    });

    test('Should NOT add a new invalid ride request', (done) => {
        const newInvalidRideRequest = {
            passengers: 'hello',
            userId: 96,
            pickUp: 888884,
            dropOff: 'hi'
        };

        RideRequest.find().then(() => {
            request(app)
            .post(URL_FRAGMENT)
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
});

// DELETE ride request
describe('DELETE /ride-requests/:id route', () => {
    test('ride-request was deleted correctly', (done) => {
        const hexId = mockRideRequests[0]._id.toHexString();
        request(app)
            .delete(`${URL_FRAGMENT}/${hexId}`)
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

    test('non existing ride-request should fire a 404 error', (done) => {
        const newHexId = new ObjectID().toHexString();
        request(app)
            .delete(`${URL_FRAGMENT}${newHexId}`)
            .expect(404)
            .end(done);  
    });

    test('an invalid id should fire a 400 error', (done) => {
        request(app)
            .delete(`${URL_FRAGMENT}/bubu1234`)
            .expect(400)
            .end(done);  
    });
});

// UPDATE ride request
describe('PATCH /ride-request/:id route', () => {
    test('ride request was correctly updated', (done) => {
        const hexId = mockRideRequests[1]._id.toHexString();
        request(app)
            .patch(`${URL_FRAGMENT}/${hexId}`)
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

    test('ride request id not found should fire a 404 error', (done) => {
        const newHexId = new ObjectID().toHexString();
        request(app)
            .patch(`${URL_FRAGMENT}/${newHexId}`)
            .send({
                status: 'closed'
            })
            .expect(404)
            .end(done);  
    });

    test('an invalid id should fire a 400 error', (done) => {
        request(app)
            .patch(`${URL_FRAGMENT}/dog1234`)
            .send({
                status: 'closed'
            })
            .expect(400)
            .end(done);  
    });
});