const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const HttpError = require("../models/errorModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

// =====================REGISTER A NEW USER
// POST : api/users/register
// UNPROTECTED

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;

    if (!name || !email || !password || !password2) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();
    const emailExists = await User.findOne({ email: newEmail });

    if (emailExists) {
      return next(new HttpError("Email already exists.", 422));
    }

    if (password.length < 6) {
      return next(new HttpError("Password should be at least 6 characters.", 422));
    }

    if (password !== password2) {
      return next(new HttpError("Passwords do not match", 422));
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = await User.create({
      name,
      email: newEmail,
      password: hashedPass,
    });

    res.status(201).json({
      message: "New user registered",
      user: { email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError("User registration failed.", 422));
  }
};

// =====================LOGIN A REGISTERED USER
// POST : api/users/login
// UNPROTECTED

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });

    if (!user) {
      return next(new HttpError("Invalid credentials", 422));
    }

    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return next(new HttpError("Invalid credentials.", 422));
    }

    const { _id: id, name } = user;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, id, name });
  } catch (error) {
    console.error(error);
    return next(new HttpError("Login failed. Please check your credentials", 422));
  }
};

// =====================USER PROFILE
// GET : api/users/:id
// UNPROTECTED

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return next(new HttpError("Failed to retrieve user", 500));
  }
};

// =====================CHANGE USER AVATAR (profile picture)
// POST : api/users/change-avatar
// PROTECTED

const changeAvatar = async (req, res, next) => {
  try {
    if (!req.files || !req.files.avatar) {
      return next(new HttpError("Please choose an image", 422));
    }

    const avatar = req.files.avatar;
    if (avatar.size > 500000) {
      return next(new HttpError("Profile picture is too large", 422));
    }

    const user = await User.findById(req.user.id);

    if (user.avatar) {
      fs.unlink(path.join(__dirname, "..", "uploads", user.avatar), (err) => {
        if (err) {
          return next(new HttpError("Error deleting old avatar", 500));
        }
      });
    }

    const fileName = `${uuid()}.${avatar.name.split('.').pop()}`;
    avatar.mv(path.join(__dirname, "..", "uploads", fileName), async (err) => {
      if (err) {
        return next(new HttpError("Error uploading avatar", 500));
      }

      user.avatar = fileName;
      await user.save();
      res.status(200).json({ avatar: fileName });
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError("Failed to change avatar", 500));
  }
};

// =====================EDIT USER DETAILS (from profile)
// POST : api/users/edit-user
// PROTECTED

const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!name || !email || !currentPassword || !newPassword || !confirmNewPassword) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id.toString() !== req.user.id) {
      return next(new HttpError("Email already in use", 422));
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return next(new HttpError("Current password is incorrect", 422));
    }

    if (newPassword !== confirmNewPassword) {
      return next(new HttpError("New passwords do not match", 422));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.name = name;
    user.email = email;

    await user.save();
    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    console.error(error);
    return next(new HttpError("Failed to update user details", 500));
  }
};

// =====================GET AUTHORS
// GET : api/users/authors
// UNPROTECTED

const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select("-password");
    res.status(200).json(authors);
  } catch (error) {
    console.error(error);
    return next(new HttpError("Failed to retrieve authors", 500));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAuthors,
  getUser,
  changeAvatar,
  editUser,
};
