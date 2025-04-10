import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";

function EditRide() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  function formatForDateTimeLocal(dateString) {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000); // convert to local time
    return localDate.toISOString().slice(0, 16);
  }

  useEffect(() => {
    if (state?.ride) {
      const ride = state.ride;
      setForm({
        pickupLocation: ride.pickupLocation,
        dropLocation: ride.dropLocation,
        departureTime: formatForDateTimeLocal(ride.departureTime),

        availableSeats: ride.availableSeats,
        vehicleModel: ride.vehicleDetails?.model || "",
        licensePlate: ride.vehicleDetails?.licensePlate || "",
      });
    } else {
      alert("No ride data found. Please navigate from your dashboard.");
      navigate("/");
    }
  }, [state, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token =
      localStorage.getItem("userToken") || localStorage.getItem("token");
    await axios.put(
      `${server}rides/${id}`,
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
    alert("Ride updated successfully.");
    navigate("/");
  };

  if (!form) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded p-6 w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold">Edit Ride</h2>
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
          Update Ride
        </button>
      </form>
    </div>
  );
}

export default EditRide;
