const Ride = require("../model/rideSchema");
const RideRequest = require("../model/rideRequestSchema");
// const axios = require('axios');
const User = require("../model/userSchema");
// const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 1. Browse Available Rides
const searchRides = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const rides = await Ride.find({
      pickupLocation: { $regex: from, $options: "i" },
      dropLocation: { $regex: to, $options: "i" },
      departureTime: { $gte: dayStart, $lte: dayEnd },
      availableSeats: { $gt: 0 },
    }).populate("driver", "name email");
    if (rides.length === 0) {
      return res.status(404).json({ message: "No rides found." });
    }
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// const getCoordinates = async (address) => {
//   const encoded = encodeURIComponent(address);
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_MAPS_API_KEY}`;

//   const response = await axios.get(url);
//   const data = response.data;

//   if (data.status === "OK") {
//     const location = data.results[0].geometry.location;
//     return { lat: location.lat, lng: location.lng };
//   }

//   throw new Error(`Geocoding failed for address: ${address}`);
// };

// const toRadians = (degree) => (degree * Math.PI) / 180;

// const calculateDistance = (coord1, coord2) => {
//   const R = 6371; // Earth radius in km
//   const dLat = toRadians(coord2.lat - coord1.lat);
//   const dLng = toRadians(coord2.lng - coord1.lng);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(coord1.lat)) *
//       Math.cos(toRadians(coord2.lat)) *
//       Math.sin(dLng / 2) *
//       Math.sin(dLng / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance in km
// };

// const searchRides = async (req, res) => {
//   try {
//     const { from, to, date } = req.query;
//     const dayStart = new Date(date);
//     const dayEnd = new Date(date);
//     dayEnd.setHours(23, 59, 59, 999);

//     const riderPickup = await getCoordinates(from);
//     const riderDrop = await getCoordinates(to);

//     const rides = await Ride.find({
//       departureTime: { $gte: dayStart, $lte: dayEnd },
//       availableSeats: { $gt: 0 }
//     }).populate("driver", "name email");

//     const ridesWithMatch = [];

//     for (const ride of rides) {
//       try {
//         const driverPickup = await getCoordinates(ride.pickupLocation);
//         const driverDrop = await getCoordinates(ride.dropLocation);

//         const pickupDistance = calculateDistance(riderPickup, driverPickup);
//         const dropDistance = calculateDistance(riderDrop, driverDrop);

//         let match = 0;
//         if (pickupDistance < 2 && dropDistance < 2) match = 100;
//         else if ((pickupDistance < 2 && dropDistance < 5) || (pickupDistance < 5 && dropDistance < 2)) match = 75;
//         else if (pickupDistance < 10 && dropDistance < 10) match = 50;

//         if (match > 0) {
//           ridesWithMatch.push({ ...ride.toObject(), matchPercentage: match });
//         }
//       } catch (innerErr) {
//         console.error(`Geocoding failed for ride ${ride._id}: ${innerErr.message}`);
//       }
//     }

//     ridesWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);

//     if (ridesWithMatch.length === 0) {
//       return res.status(404).json({ message: "No matching rides found." });
//     }

//     res.status(200).json(ridesWithMatch);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };





// 2. Request to Join Ride
const requestToJoin = async (req, res) => {
  try {
    const user = req.user;
    const rideId = req.params.rideId;

    const existingRequest = await RideRequest.findOne({
      ride: rideId,
      rider: user._id,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You have already requested to join this ride." });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }

    const request = await RideRequest.create({
      ride: rideId,
      rider: user._id,
    });

    res.status(201).json({ message: "Ride request sent.", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. View My Ride Requests
const viewMyRequests = async (req, res) => {
  try {
    const user = req.user;

    const requests = await RideRequest.find({ rider: user._id }).populate({
      path: "ride",
      populate: { path: "driver", select: "name email" },
    });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// View incoming requests for driver's rides
const getIncomingRequests = async (req, res) => {
  try {
    const driverId = req.user._id; // Updated to use req.user from verifyJWT
    const myRides = await Ride.find({ driver: driverId });

    const rideIds = myRides.map((ride) => ride._id);
    const requests = await RideRequest.find({ ride: { $in: rideIds } })
      .populate("ride")
      .populate("rider", "-password -refreshToken");

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch ride requests" });
  }
};

// Approve/Reject a ride request
const updateRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const rideRequest = await RideRequest.findById(requestId).populate("ride");
    if (!rideRequest)
      return res.status(404).json({ message: "Request not found" });

    // Optional: check if user is a driver
    if (req.user.role && req.user.role !== "driver") {
      return res
        .status(403)
        .json({ message: "Only drivers can update request status." });
    }

    // Check if the logged-in user is the ride's driver
    if (rideRequest.ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    rideRequest.status = status;
    await rideRequest.save();

    res.json({ message: `Request ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update request status" });
  }
};

module.exports = {
  searchRides,
  requestToJoin,
  viewMyRequests,
  getIncomingRequests,
  updateRequestStatus,
};