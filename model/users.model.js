const mongoose = require("mongoose");

const userSchemas = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: false,
  },
  address: {
    type: Object,
    required: true,
  },
  timeZone: {
    type: Object,
    required: true,
  },
  businessInfo: {
    type: Object,
    required: true,
  },
  deletedAt: { type: Date, expires: "30days" },
});
const Users = mongoose.model("users", userSchemas);
module.exports = Users;
