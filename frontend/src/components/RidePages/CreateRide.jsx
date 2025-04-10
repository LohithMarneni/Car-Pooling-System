import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { server } from "../../main";

function CreateRide() {
  const [form, setForm] = useState({
    pickupLocation: "",
    dropLocation: "",
    departureTime: "",
    availableSeats: "",
    vehicleModel: "",
    licensePlate: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      await axios.post(
        `${server}rides/`,
        {
          pickupLocation: form.pickupLocation,
          dropLocation: form.dropLocation,
          departureTime: form.departureTime,
          availableSeats: form.availableSeats,
          vehicleDetails: {
            model: form.vehicleModel,
            licensePlate: form.licensePlate,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Ride created successfully!");
      navigate("/"); // Redirect to dashboard
    } catch (err) {
      console.error("Create ride error:", err);
      alert("Failed to create ride.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded p-6 w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold">Create a Ride</h2>
        {[
          "pickupLocation",
          "dropLocation",
          "departureTime",
          "availableSeats",
          "vehicleModel",
          "licensePlate",
        ].map((field) => (
          <input
            key={field}
            type={field === "departureTime" ? "datetime-local" : "text"}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            className="w-full p-2 border rounded"
            required
          />
        ))}
        <button className="w-full bg-black text-white py-2 rounded hover:bg-black">
          Create Ride
        </button>
      </form>
    </div>
  );
}

export default CreateRide;
