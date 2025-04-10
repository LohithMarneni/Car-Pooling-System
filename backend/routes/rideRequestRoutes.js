const express = require('express');
const router = express.Router();
const {
    requestToJoin,
    viewMyRequests,
    searchRides,
    getIncomingRequests,
  updateRequestStatus
} = require('../controllers/rideRequestController');

router.get('/search', searchRides);
router.get('/my', viewMyRequests);
router.get('/for-my-rides', getIncomingRequests);
router.get('/:rideId', requestToJoin);
router.patch('/:id/status', updateRequestStatus);
module.exports = router;
