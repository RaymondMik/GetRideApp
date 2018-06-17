const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../../app.js');
const {User} = require('./../../database/models/user.js');
const {populateUsers, users} = require('./../databaseHandler.js');

const URL_FRAGMENT = '/users';

beforeEach(populateUsers);

// GET me user
describe('GET users/me', () => {
    test('should return user if authenticated', (done) => {
        request(app)
            .get(`${URL_FRAGMENT}/me`)
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
            .get(`${URL_FRAGMENT}/me`)
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
            .post(URL_FRAGMENT)
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
                })
            });
    });

    test('should return a validation error if req is invalid', (done) => {
        const email = 'hello@example';
        const password = 'hello90';
        const type = 'client';

        request(app)
            .post(URL_FRAGMENT)
            .send({email, password, type})
            .expect(400)
            .end(done);
    });

    test('should return an error if email is already in use', (done) => {
        const email = users[0].email;
        const password = 'hello777009';
        const type = 'client';

        request(app)
            .post(URL_FRAGMENT)
            .send({email, password, type})
            .expect(400)
            .end(done);
    });
});
