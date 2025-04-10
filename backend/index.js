require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOption");
const connectDB = require("./config/dbConn");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const verifyJWT = require("./middleware/verifyJWT");
const PORT = process.env.PORT || 3500;
// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));
//middleware for cookies
app.use(cookieParser());
// built-in middleware for json
app.use(express.json());
app.use(cors(corsOptions));
// app.use(cors());
app.use("/api/auth", require("./routes/authRoute"));
app.use(verifyJWT);
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/rides", require("./routes/rideRoutes"));
app.use("/api/ride-requests", require("./routes/rideRequestRoutes"));

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404);
  if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
