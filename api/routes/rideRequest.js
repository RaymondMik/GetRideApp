const express = require('express');
const router = express.Router();
const {ObjectID} = require('mongodb');
const {mongoose} = require('../../database/mongoose.js');
const {RideRequest} = require('../../database/models/rideRequest.js');
const {authenticate} = require('../../middlewares/authenticate');

// GET ALL RIDE REQUESTS route
router.get('/', authenticate, (req, res) => {
    RideRequest.find({_creator: req.user._id})
        .then((requests) => {
            res.send({requests});
        }).catch( (error) => {
            res.status(400).send(error);
        });
});

// GET SINGLE RIDE REQUEST route
router.get('/:id', authenticate,(req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send(`The ID: ${req.params.id} is not valid`);

    RideRequest.findOne({
        _id: req.params.id,
        _creator: req.user._id
    }).then((rideRequest) => {
        if (!rideRequest) return res.status(404).send('rideRequest not found');
        res.send(rideRequest);
    }).catch((e) => {
        res.status(500).send(`The following error ${e} occured while fetching data`);
    });  
});

// POST RIDE REQUEST route
router.post('/', authenticate, (req, res) => {
    const newRideRequest = new RideRequest({
        _creator: req.user._id,
        pickUp: req.body.pickUp,
        dropOff: req.body.dropOff,
        passengers: req.body.passengers,
        date: req.body.date
    });

    newRideRequest.save().then((doc) => {
        res.status(200).send(doc)
    }).catch((error) => {
        res.status(400).send(error);
    });
});

// DELETE SINGLE RIDE REQUEST route
router.delete('/:id', authenticate, (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send(`The ID: ${req.params.id} is not valid`);

    RideRequest.findOneAndRemove({
        _id: req.params.id,
        _creator: req.user._id
    }).then((result) => {
        if (!result) return res.status(404).send('RideRequest not found');

        res.status(200).send(result);
    }).catch((e) => {
        return res.status(500).send('There was an error while deleting RideRequest');
    });
});

// UPDATE SINGLE RIDE REQUEST route
router.patch('/:id', authenticate, (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send(`The ID: ${req.params.id} is not valid`);

    const body = {status: req.body.status};

    if (typeof body.status !== 'string') {
        return res.status(400).send(`The paramater 'status' should be either 'open', 'accepted', 'rejected', 'cancelled', 'closed'`);
    }

    RideRequest.findOneAndUpdate(
        {_id: req.params.id, _creator: req.user._id},
        {$set: body}, 
        {new: true, runValidators: true}
    ).then( (rideRequest) => { 
        if (!rideRequest) return res.status(404).send('Riderequest not found');

        return res.send({rideRequest});
    }).catch( (err) => res.status(500).send('There was an error while updating RideRequest'));
});

module.exports = router;