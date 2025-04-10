import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useState } from "react";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="flex justify-between items-center p-5 bg-white text-white w-full border-b-2 border-black shadow-md relative">
      <h1 className="text-2xl font-bold text-black">Car Pooling System</h1>
      <div className="text-black flex items-center">
        <Link className="mx-3 hover:text-gray-700" to="/">
          Home
        </Link>
        <Link className="mx-3 hover:text-gray-700" to="/about">
          AboutUs
        </Link>
        <Link className="mx-3 hover:text-gray-700" to="/contactus">
          ContactUs
        </Link>

        {!isAuthenticated ? (
          <Link
            className="mx-3 bg-black text-white px-3 py-2 rounded hover:bg-gray-800"
            to="/login"
          >
            Login
          </Link>
        ) : (
          <div className="relative inline-block text-left">
            <button
              onClick={toggleDropdown}
              className="ml-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 focus:outline-none"
            >
              Profile ▼
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
