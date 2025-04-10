const Ride = require("../model/rideSchema");
const User = require("../model/userSchema");

// Create Ride
const createRide = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropLocation,
      departureTime,
      availableSeats,
      vehicleDetails,
      preferences,
    } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "driver") {
      return res
        .status(403)
        .json({ message: "Only drivers can create rides." });
    }

    // ✅ Parse and validate the departure time
    const parsedDepartureTime = new Date(departureTime);
    if (isNaN(parsedDepartureTime.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid departure time format." });
    }

    const ride = await Ride.create({
      driver: user._id,
      pickupLocation,
      dropLocation,
      departureTime: parsedDepartureTime,
      availableSeats,
      vehicleDetails,
      preferences,
    });

    res.status(201).json({ message: "Ride created successfully", ride });
  } catch (error) {
    console.error("Ride creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// View My Rides
const viewMyRides = async (req, res) => {
  try {
    const user = req.user;

    const rides = await Ride.find({ driver: user._id }).populate(
      "driver",
      "name email"
    );
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit Ride
const updateRide = async (req, res) => {
  try {
    const user = req.user;
    const ride = await Ride.findById(req.params.id);

    if (!ride || ride.driver.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this ride." });
    }

    const updatedRide = await Ride.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Ride updated", ride: updatedRide });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Ride
const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride || ride.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this ride." });
    }

    await ride.deleteOne();
    res.status(200).json({ message: "Ride deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get ride history for both drivers and riders
const getRideHistory = async (req, res) => {
  try {
    const user = req.user; // get full user object from verifyJWT middleware
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentTime = new Date();
    let history = [];

    if (user.role === "driver") {
      // 🚗 Driver: Past rides they created
      history = await Ride.find({
        driver: user._id,
        departureTime: { $lt: currentTime },
      }).sort({ departureTime: -1 });
    } else {
      // 👤 Rider: Past approved rides they joined
      const approvedRequests = await RideRequest.find({
        rider: user._id,
        status: "approved",
      }).populate("ride");

      history = approvedRequests
        .filter((req) => req.ride && req.ride.departureTime < currentTime)
        .map((req) => req.ride);
    }
    if (history.length === 0) {
      return res.status(404).json({ message: "No rides found" });
    }

    res.status(200).json({ history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch ride history" });
  }
};

module.exports = {
  createRide,
  viewMyRides,
  updateRide,
  deleteRide,
  getRideHistory,
};
