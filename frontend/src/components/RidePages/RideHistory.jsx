import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../main";

function RideHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");
        const res = await axios.get(`${server}rides/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const past = res.data.filter(
          (ride) => new Date(ride.departureTime) < new Date()
        );
        setRides(past);
      } catch (err) {
        console.error("Failed to fetch ride history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Ride History</h2>
        {loading ? (
          <p>Loading...</p>
        ) : rides.length === 0 ? (
          <p>No past rides found.</p>
        ) : (
          <ul className="space-y-3">
            {rides.map((ride) => (
              <li key={ride._id} className="border p-3 rounded">
                <div>
                  <strong>From:</strong> {ride.pickupLocation}
                </div>
                <div>
                  <strong>To:</strong> {ride.dropLocation}
                </div>
                <div>
                  <strong>Time:</strong>{" "}
                  {new Date(ride.departureTime).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RideHistory;
