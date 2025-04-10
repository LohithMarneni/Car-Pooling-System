import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Home from "./components/Home/Home.jsx";
import AboutMe from "./components/AboutMe/AboutMe.jsx";
import ContactUs from "./components/ContactUs/ContactUs.jsx";
import Login from "./components/Login/Login.jsx";
import SignUp from "./components/SignUp/SignUp.jsx";
import Profile from "./components/Profile/Profile";
import { AuthProvider } from "./context/authContext.jsx";
import CreateRide from "./components/RidePages/CreateRide";
import EditRide from "./components/RidePages/EditRide";
import RideHistory from "./components/RidePages/RideHistory";
export const server = "http://localhost:3502/api/";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <AboutMe /> },
      { path: "contactus", element: <ContactUs /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
      { path: "profile", element: <Profile /> },
      { path: "create-ride", element: <CreateRide /> },
      { path: "ride-history", element: <RideHistory /> },
      { path: "edit-ride/:id", element: <EditRide /> },
      { path: "*", element: <h1>Not Found</h1> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
