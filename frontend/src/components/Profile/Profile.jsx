import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import { server } from "../../main";
function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const getProfile = async () => {
    try {
      // console.log("Token from storage:", localStorage.getItem("token"));
      const res = await axios.get(`${server}user/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data =
        typeof res.data === "string" ? JSON.parse(res.data) : res.data;

      data.preferences = {
        smoking: false,
        pets: false,
        music: false,
        femaleOnly: false,
        ...data.preferences,
      };
      data.emergencyContacts = data.emergencyContacts?.length
        ? data.emergencyContacts
        : [""];

      setUser(data);
      setForm({ ...data });
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("preferences.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: checked },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEmergencyContactChange = (index, value) => {
    const updated = [...form.emergencyContacts];
    updated[index] = value;
    setForm((prev) => ({ ...prev, emergencyContacts: updated }));
  };

  const handleAddContact = () => {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, ""],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = { ...form };
      delete updated.email; // Optional
      const res = await axios.put(`${server}user/profile`, updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Profile updated!");
      setUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    try {
      await axios.delete(`${server}user/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      logout();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>

      {!isEditing ? (
        <>
          <div className="space-y-3">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>role:</strong> {user.role}
            </p>
            <div>
              <strong>Preferences:</strong>
              <ul className="list-disc ml-5">
                {Object.entries(user.preferences).map(
                  ([key, val]) =>
                    val && (
                      <li key={key}>{key[0].toUpperCase() + key.slice(1)}</li>
                    )
                )}
              </ul>
            </div>
            <div>
              <strong>Emergency Contacts:</strong>
              <ul className="list-disc ml-5">
                {user.emergencyContacts.map((contact, idx) => (
                  <li key={idx}>{contact}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              className="bg-black text-white px-4 py-2 rounded"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button className="text-black underline" onClick={handleDelete}>
              Delete Account
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Name"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Phone"
          />
          <div className="grid grid-cols-2 gap-4">
            {["smoking", "pets", "music", "femaleOnly"].map((pref) => (
              <label key={pref} className="flex items-center">
                <input
                  type="checkbox"
                  name={`preferences.${pref}`}
                  checked={form.preferences[pref]}
                  onChange={handleChange}
                  className="mr-2"
                />
                {pref[0].toUpperCase() + pref.slice(1)}
              </label>
            ))}
          </div>

          <div>
            <h4 className="font-semibold mt-4 mb-2">Emergency Contacts</h4>
            {form.emergencyContacts.map((contact, idx) => (
              <input
                key={idx}
                type="text"
                value={contact}
                onChange={(e) =>
                  handleEmergencyContactChange(idx, e.target.value)
                }
                className="w-full p-2 border rounded mb-2"
                placeholder={`Contact ${idx + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={handleAddContact}
              className="text-black underline"
            >
              + Add Contact
            </button>
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;
