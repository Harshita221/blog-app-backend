const express = require('express');
const cors = require('cors');
const { connect } = require('mongoose');
require('dotenv').config();
const upload = require('express-fileupload');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json({ extended: true })); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); // Enable CORS for specified origin
app.use(upload()); // Enable file upload support

// Serve static files from the uploads directory
app.use('/uploads', express.static(__dirname + '/uploads'));

// Routes
app.use('/api/users', userRoutes); // User-related routes
app.use('/api/posts', postRoutes); // Post-related routes

// Error handling middleware
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Handle all other errors

// Connect to MongoDB and start the server
console.log("Connecting to MongoDB...");

// Function to connect to the database
const connectDB = async () => {
  try {
    await connect("mongodb+srv://harshita:ND3Wtd5kXqajKogD@blog-mern-app.wim2z.mongodb.net/?retryWrites=true&w=majority&appName=Blog-MERN-App");
    console.log("MongoDB connected successfully");

    // Start the server
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server started on port ${process.env.PORT || 8000}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the process with an error code
  }
};

// Initiate database connection
connectDB();
