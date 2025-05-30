import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // console.log(credentials);
      await login(credentials.email, credentials.password);
      setSuccess("Login successful!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setError(error.message || "Invalid Credentials or Server Error");
    }
  };

  return (
    <div className="w-full h-screen flex relative overflow-hidden">
      {/* Backgrounds */}
      <div className="w-1/2" style={{ backgroundColor: "#565c58" }}></div>
      <div className="w-1/2 bg-white"></div>

      {/* Centered Login Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-1/3">
          <h2 className="text-2xl font-bold text-center mb-4 text-black">
            Login
          </h2>
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          {success && (
            <p className="text-green-500 text-center mb-2">{success}</p>
          )}
          <form className="space-y-4" onSubmit={handleOnSubmit}>
            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full p-2 border rounded-lg focus:outline-none"
                placeholder="Enter Email"
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full p-2 rounded-lg focus:outline-none border"
                placeholder="Enter your password"
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
              />
            </div>
            <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 cursor-pointer">
              Login
            </button>
          </form>
          <p className="text-center mt-4">
            Don't have an account?{" "}
            <a href="/signup" className="text-black">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
