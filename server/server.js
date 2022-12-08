const express = require("express");
const app = express();
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");
const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 8001;

// Connecting to MongoDB
const connectDB = require("./config/db");
connectDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes of the app
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/form/", require("./routes/formRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));

// Error Middleware
app.use(errorHandler);

// test route
app.get("/", (req, res) => {
    res.status(200).send("Backend Server");
});

app.listen(PORT, (req, res) => {
    console.log(`SERVER IS LISTENING AT PORT ${PORT}!`);
});
