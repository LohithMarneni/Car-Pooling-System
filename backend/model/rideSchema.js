const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  departureTime: { type: Date, required: true },
  availableSeats: { type: Number, required: true },
  vehicleDetails: {
    model: String,
    licensePlate: String,
  },
  preferences: {
    smoking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    music: { type: Boolean, default: false },
    femaleOnly: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ride", rideSchema);
