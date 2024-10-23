const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"] // Ensures name is provided
  },
  email: { 
    type: String, 
    required: [true, "Email is required"], // Ensures email is provided
    unique: true, // Ensures unique emails across users
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"], // Email validation regex
  },
  password: { 
    type: String, 
    required: [true, "Password is required"] // Ensures password is provided
  },
  avatar: { 
    type: String, 
    default: null, // Optional field, defaults to null if no avatar is provided
  },
  posts: { 
    type: Number, 
    default: 0, // Default value for post count
  },
});

// Exporting the User model
module.exports = model('User', userSchema);
