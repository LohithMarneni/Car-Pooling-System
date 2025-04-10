const Ride = require("../model/rideSchema");
const RideRequest = require("../model/rideRequestSchema");
const User = require("../model/userSchema");
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
