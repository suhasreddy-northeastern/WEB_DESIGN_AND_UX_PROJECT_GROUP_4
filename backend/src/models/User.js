// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    validate: {
      validator: function (v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid name! Only alphabetic characters are allowed.`,
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
  },
  type: {
    type: String,
    required: [true, "User type is required"],
    enum: ["admin", "broker", "user"],
    lowercase: true,
  },  
  imagePath: {
    type: String,
    default: null,
  },
});

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) return next();

  try {
    // Get salt rounds from environment variable
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

    // Generate a salt
    const salt = await bcrypt.genSalt(saltRounds);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
