const express = require('express');
const router = express.Router();
const {
    createRide,
    viewMyRides,
    updateRide,
    deleteRide,
    getRideHistory
} = require('../controllers/rideController');

router.post('/', createRide);
router.get('/my', viewMyRides);
router.get('/history', getRideHistory);
router.put('/:id', updateRide);
router.delete('/:id', deleteRide);
module.exports = router;
