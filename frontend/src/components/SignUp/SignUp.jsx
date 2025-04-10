import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";

function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "rider", // default role
    phone: "",
    preferences: {
      smoking: false,
      pets: false,
      music: false,
      femaleOnly: false,
    },
    emergencyContacts: [""],
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [name]: checked },
    }));
  };

  const handleEmergencyContactChange = (index, value) => {
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts[index] = value;
    setFormData({ ...formData, emergencyContacts: updatedContacts });
  };

  const addEmergencyContactField = () => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, ""],
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(server + "auth/register", formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess("User registered successfully!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Registration failed. Try again."
      );
    }
  };

  return (
    <div className="w-full h-screen flex relative">
      {/* Backgrounds */}
      <div className="w-1/2 bg-white"></div>
      <div className="w-1/2" style={{ backgroundColor: "#565c58" }}></div>

      <div className="absolute inset-0 flex items-center justify-center overflow-auto p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold text-center mb-4 text-black">
            Sign Up
          </h2>

          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          {success && (
            <p className="text-green-500 text-center mb-2">{success}</p>
          )}

          <form className="space-y-4" onSubmit={handleOnSubmit}>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-2 border rounded-lg"
              required
            />

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border rounded-lg"
              required
            />

            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-2 border rounded-lg"
              required
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="rider">Rider</option>
              <option value="driver">Driver</option>
            </select>

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full p-2 border rounded-lg"
            />

            <div>
              <label className="block font-semibold mb-2">Preferences:</label>
              <div className="grid grid-cols-2 gap-2">
                {["smoking", "pets", "music", "femaleOnly"].map((pref) => (
                  <label key={pref} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={pref}
                      checked={formData.preferences[pref]}
                      onChange={handlePreferenceChange}
                    />
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Emergency Contacts:
              </label>
              {formData.emergencyContacts.map((contact, index) => (
                <input
                  key={index}
                  type="text"
                  value={contact}
                  onChange={(e) =>
                    handleEmergencyContactChange(index, e.target.value)
                  }
                  placeholder={`Contact ${index + 1}`}
                  className="w-full p-2 border rounded-lg mb-2"
                />
              ))}
              <button
                type="button"
                onClick={addEmergencyContactField}
                className="text-sm text-black-600 hover:underline"
              >
                + Add another contact
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
