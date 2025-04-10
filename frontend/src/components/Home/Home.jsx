import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { server } from "../../main";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [searchData, setSearchData] = useState({ from: "", to: "", date: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const isDriver = user && user.role && user.role.toLowerCase() === "driver";

  const token =
    localStorage.getItem("userToken") || localStorage.getItem("token");

  // Fetch rides created by the driver
  const fetchMyRides = async () => {
    try {
      const res = await axios.get(`${server}rides/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(res.data);
    } catch (err) {
      console.error("Error fetching rides:", err);
      alert("Failed to load your rides.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch incoming ride requests (for drivers)
  const fetchIncomingRequests = async () => {
    try {
      const res = await axios.get(`${server}ride-requests/for-my-rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncomingRequests(res.data);
    } catch (err) {
      console.error("Error fetching incoming requests:", err);
    }
  };

  // Update request status (approve/reject)
  const updateRequestStatus = async (id, status) => {
    try {
      await axios.patch(
        `${server}ride-requests/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Request ${status}`);
      fetchIncomingRequests();
    } catch (err) {
      console.error("Failed to update request status:", err);
      alert("Failed to update request status.");
    }
  };

  // Rider: Search available rides
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { from, to, date } = searchData;

      // Format date as YYYY-MM-DD only
      const onlyDate = new Date(date).toISOString().split("T")[0]; // e.g., "2025-04-11"

      const res = await axios.get(`${server}ride-requests/search`, {
        params: {
          from,
          to,
          date: onlyDate, // send just the date string
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setSearchResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
      alert(err.response?.data?.message || "Search failed.");
    }
  };

  // Rider: Request to join a ride
  const requestToJoin = async (rideId) => {
    try {
      await axios.get(`${server}ride-requests/${rideId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Request sent successfully!");
    } catch (err) {
      console.error("Request to join failed:", err);
      alert(err.response?.data?.message || "Failed to send request.");
    }
  };

  // Rider: View my requests
  const fetchMyRequests = async () => {
    try {
      const res = await axios.get(`${server}ride-requests/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyRequests(res.data);
    } catch (err) {
      console.error("Error fetching my requests:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    if (isDriver) {
      fetchMyRides();
      fetchIncomingRequests();
    } else {
      fetchMyRequests();
      setLoading(false);
    }
  }, [user]);

  const handleDeleteRide = async (rideId) => {
    if (window.confirm("Are you sure you want to delete this ride?")) {
      try {
        await axios.delete(`${server}rides/${rideId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Ride deleted successfully.");
        fetchMyRides();
      } catch (err) {
        console.error("Error deleting ride:", err);
        alert("Failed to delete ride.");
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
        <p>Please log in to access your dashboard.</p>
      </div>
    );
  }

  if (!isDriver) {
    return (
      <div className="min-h-screen p-6 bg-gray-100">
        <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded">
          <h1 className="text-3xl font-bold mb-6">Welcome Rider!</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6 space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="From"
                value={searchData.from}
                onChange={(e) =>
                  setSearchData({ ...searchData, from: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="text"
                placeholder="To"
                value={searchData.to}
                onChange={(e) =>
                  setSearchData({ ...searchData, to: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="date"
                value={searchData.date}
                onChange={(e) =>
                  setSearchData({ ...searchData, date: e.target.value })
                }
                className="border p-2 rounded"
                required
              />
              <button className="bg-black text-white px-4 py-2 rounded">
                Search
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Available Rides</h2>
              <ul className="space-y-4">
                {searchResults.map((ride) => (
                  <li
                    key={ride._id}
                    className="border p-4 rounded bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <p>
                        <strong>
                          {ride.pickupLocation} → {ride.dropLocation}
                        </strong>
                      </p>
                      <p>
                        Date: {new Date(ride.departureTime).toLocaleString()}
                      </p>
                      <p>Driver: {ride.driver.name}</p>
                    </div>
                    <button
                      onClick={() => requestToJoin(ride._id)}
                      className="bg-black text-white px-4 py-2 rounded"
                    >
                      Request to Join
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* My Requests */}
          <div>
            <h2 className="text-xl font-semibold mb-2">My Ride Requests</h2>
            {myRequests.length === 0 ? (
              <p>No ride requests yet.</p>
            ) : (
              <ul className="space-y-4">
                {myRequests.map((req) => (
                  <li key={req._id} className="border p-4 rounded bg-gray-50">
                    <p>
                      <strong>
                        {req.ride.pickupLocation} → {req.ride.dropLocation}
                      </strong>
                    </p>
                    <p>Status: {req.status}</p>
                    <p>Driver: {req.ride.driver.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white shadow rounded p-6">
        <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>

        <div className="mb-6 space-x-4">
          <Link
            to="/create-ride"
            className="px-4 py-2 bg-black text-white rounded hover:bg-black"
          >
            Create a Ride
          </Link>
          <Link
            to="/ride-history"
            className="px-4 py-2 bg-black text-white rounded hover:bg-black"
          >
            Ride History
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mb-4">My Rides</h2>
        {loading ? (
          <p>Loading rides...</p>
        ) : rides.length === 0 ? (
          <p>No rides created yet.</p>
        ) : (
          <table className="min-w-full border border-gray-300 mb-6">
            <thead>
              <tr>
                <th className="border p-2">Pickup</th>
                <th className="border p-2">Drop</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Seats</th>
                <th className="border p-2">Vehicle</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride._id}>
                  <td className="border p-2">{ride.pickupLocation}</td>
                  <td className="border p-2">{ride.dropLocation}</td>
                  <td className="border p-2">
                    {new Date(ride.departureTime).toLocaleString()}
                  </td>
                  <td className="border p-2">{ride.availableSeats}</td>
                  <td className="border p-2">
                    Model: {ride.vehicleDetails?.model || "N/A"}
                    <br />
                    Plate: {ride.vehicleDetails?.licensePlate || "N/A"}
                  </td>
                  <td className="border p-2">
                    <Link
                      to={`/edit-ride/${ride._id}`}
                      state={{ ride }}
                      className="text-black underline mr-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteRide(ride._id)}
                      className="text-black underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Incoming Requests Section */}
        <h2 className="text-2xl font-semibold mb-4">Incoming Ride Requests</h2>
        {incomingRequests.length === 0 ? (
          <p>No ride requests yet.</p>
        ) : (
          <ul className="space-y-4">
            {incomingRequests.map((req) => (
              <li key={req._id} className="border p-4 rounded bg-gray-50">
                <p>
                  <strong>
                    {req.ride.pickupLocation} → {req.ride.dropLocation}
                  </strong>
                </p>
                <p>
                  Rider: {req.rider.name} ({req.rider.email})
                </p>
                <p>Status: {req.status}</p>
                {req.status === "pending" && (
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => updateRequestStatus(req._id, "approved")}
                      className="bg-black text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateRequestStatus(req._id, "rejected")}
                      className="bg-black text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Home;
